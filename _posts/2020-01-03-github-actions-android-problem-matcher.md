---
layout: post
title: Tooling — GitHub Actions for Android (and deep dive into problem matchers)
---

**Edit:** Updated after finding [official documentation](https://github.com/actions/toolkit/blob/master/docs/problem-matchers.md).

(This post is a deep dive into how to problem matchers work on GitHub Actions and how to develop your own. If you just want to enable problem matchers for your Android workflows, scroll to the end.)

Getting started with [GitHub Actions](https://github.com/features/actions) for Android is very straightforward. Basically just add this file (e.g. as `.github/workflows/continuous-integration-workflow.yml`):

```yaml
name: Android CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Setup JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
    - name: Build Android
      run: |
        ./gradlew build
```

One of the really nice features about GitHub Actions as a CI tool is it's ability to pick up errors and warnings in the logs and annotate the PRs inline. However, as far as I can tell there are/were no actions on the [marketplace](https://github.com/marketplace?type=actions) that support Android warnings and errors, so you end up spending a lot of time scrolling through logs.

The official documentation of problem matchers can be found in the [actions/toolkit](https://github.com/actions/toolkit/blob/master/docs/problem-matchers.md) repo.

In order to add a new problem matcher you add a log line using a special format, which points to a JSON file that defines what GitHub should look for in the logs to identify problems. If your JSON file is called `.github/gradle-matcher.json`, add this to your workflow's step `echo "::add-matcher::.github/gradle-matcher.json"`. When successful GitHub will show this in the logs:

```
Added matchers: 'gradle'. Problem matchers scan action output for known warning or error strings and report these inline.
```

GitHub reads the problem matcher from the JSON key `problemMatcher`. It appears as if the format of `problemMatcher` is inspired by Visual Studio Code's problem matchers used in tasks, which is documented ([VS Code: Defining a problem matcher](https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher)). So if you're lucky you might be able to find a problem matcher for the compiler/tool that you need and use that.

Problem matchers added to one step remain for subsequent steps in the workflow.

To write your own problem matcher isn't hard but requires some work. And especially to get the regular expression correct can take a few attempts, so waiting for a CI roundtrip can make it a frustrating exercise. Instead I would recommend creating a build task in VS Code and build your code locally until you're happy. Do that by creating a file called `.vscode/tasks.json` with the following content:

```json
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Gradle CI",
      "type": "shell",
      "command": "./gradlew build -PisCI=true",
      "windows": {
        "command": ".\\gradlew.bat build -PisCI=true"
      },
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": [
        // put your problem matchers here
      ]
    }
  ]
}
```

And run it in VS Code (`F1` ➤ Tasks: Run Build Task). The identified problems will show up in the Problems panel. You also get some code completion and documentation when editing the problem matchers in `tasks.json`.

However, there are some differences that I've noticed between GitHub Actions and VS Code:

* `owner` is required on GitHub Actions (and has to be unique) but is defaulted to `"external"` in VS Code
* `fileLocation` can be left out on GitHub Actions (and still support relative and absolute paths), but needs to be set to `"absolute"` in VS Code for absolute paths
* GitHub Actions seems to struggle when including multiple matchers in one JSON file (the problems are detected, but on some matchers the location ends up being `.github:1`), whereas it works well in VS Code

---

So far I've written five problem matchers, for Gradle, Kotlin compiler and Android Lint. In the end I wrapped out these changes into it's own GitHub Actions project. Still the changes I needed to make to my project are listed here in order to show how you can write your own problem matchers if you have other needs.

`.github/workflows/continuous-integration-workflow.yml`:

```yaml
name: Android CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Setup JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
    - name: Build Android
      run: |
        echo "::add-matcher::.github/android-lint-file-matcher.json"
        echo "::add-matcher::.github/android-lint-line-matcher.json"
        echo "::add-matcher::.github/gradle-matcher.json"
        echo "::add-matcher::.github/kotlin-error-matcher.json"
        echo "::add-matcher::.github/kotlin-warning-matcher.json"
        ./gradlew build -PisCI=true
```

In `app/build.gradle` these changes makes the Android Lint problems appear in the log:

```groovy
android {
  lintOptions {
    textReport project.hasProperty('isCI')
    textOutput 'stdout'
  }
}
```

`.github/android-lint-file-matcher.json`:

```json
{
  // Example:
  // /path/to/file/file.class: Warning: checkClientTrusted is empty, which could cause insecure network traffic due to trusting arbitrary TLS/SSL certificates presented by peers [TrustAllX509TrustManager]
  "problemMatcher": [
    {
      "owner": "android-lint-file",
      "pattern": [
        {
          "regexp": "^(.+):\\s+(Warning|Error):\\s+(.+)\\s+\\[(.+)\\]$",
          "file": 1,
          "severity": 2,
          "message": 3,
          "code": 4,
          "kind": "file"
        }
      ]
    }
  ]
}
```

`.github/android-lint-line-matcher.json`:

```json
{
    // Example:
    // /path/to/file/build.gradle:55: Warning: A newer version of androidx.core:core-ktx than 1.2.0-beta01 is available: 1.2.0-rc01 [GradleDependency]
    "problemMatcher": [
      {
        "owner": "android-lint-line",
        "pattern": [
          {
            "regexp": "^(.+):(\\d+):\\s+(Warning|Error):\\s+(.+)\\s+\\[(.+)\\]$",
            "file": 1,
            "line": 2,
            "severity": 3,
            "message": 4,
            "code": 5
          }
        ]
      }
    ]
}
```

`.github/gradle-matcher.json`:

```json
{
  // Example:
  // warning   unused-exclude-by-conf             the exclude dependency is not in your dependency graph, so has no effect
  // app/build.gradle:45
  "problemMatcher": [
    {
      "owner": "gradle",
      "pattern": [
        {
          "regexp": "^(error|quiet|warning|lifecycle|info|debug)\\s+(\\S+)\\s+(.+)$",
          "severity": 1,
          "code": 2,
          "message": 3
        },
        {
          "regexp": "^([^\\s]+):([\\d]+)$",
          "file": 1,
          "line": 2
        }
      ]
    }
  ]
}
```

`.github/kotlin-error-matcher.json`:

```json
{
  // Example:
  // e: /path/to/file/KotlinFile.kt: (14, 5): Val cannot be reassigned
  "problemMatcher": [
    {
      "owner": "kotlin-error",
      "pattern": [
        {
          "regexp": "^e:\\s+(\\S+):\\s+\\((\\d+),\\s+(\\d+)\\):\\s+(.+)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "message": 4
        }
      ],
      "severity": "error"
    }
  ]
}
```

`.github/kotlin-warning-matcher.json`:

```json
{
  // Example:
  // w: /path/to/file/KotlinFile.kt: (14, 5): Parameter 'foo' is never used
  "problemMatcher": [
    {
      "owner": "kotlin-warning",
      "pattern": [
        {
          "regexp": "^w:\\s+(\\S+):\\s+\\((\\d+),\\s+(\\d+)\\):\\s+(.+)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "message": 4
        }
      ],
      "severity": "warning"
    }
  ]
}
```

---

**N.B.** I've wrapped up these changes in a GitHub Actions project on the GitHub Marketplace: [Android Problem Matchers](https://github.com/marketplace/actions/android-problem-matchers). The source code is up on GitHub: [jonasb/android-problem-matchers-action](https://github.com/jonasb/android-problem-matchers-action). So in order to use these problem matchers in your own workflow you only need to add these two lines:

```yaml
    - name: Setup Android problem matchers
      uses: jonasb/android-problem-matchers-action@v1
```

All in all, problem matchers are easy to add to GitHub Actions and makes it a very extensible CI platform.
