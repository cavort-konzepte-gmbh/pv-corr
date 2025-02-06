---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

body:
  - type: input
    id: submitter
    attributes:
      label: Submitter Name
      description: Please enter your name
      placeholder: John Doe
    validations:
      required: true

  - type: textarea
    id: bug-description
    attributes:
      label: Describe the bug
      description: A clear and concise description of what the bug is.
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: To Reproduce
      description: Steps to reproduce the behavior
      value: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: A clear and concise description of what you expected to happen.
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: If applicable, add screenshots to help explain your problem.
    validations:
      required: false

  - type: input
    id: desktop-os
    attributes:
      label: Desktop OS
      description: e.g. iOS
      placeholder: Windows 11
    validations:
      required: false

  - type: input
    id: desktop-browser
    attributes:
      label: Desktop Browser
      description: e.g. chrome, safari
      placeholder: Chrome
    validations:
      required: false

  - type: input
    id: desktop-version
    attributes:
      label: Desktop Browser Version
      description: e.g. 22
      placeholder: 120.0.6099.130
    validations:
      required: false

  - type: input
    id: mobile-device
    attributes:
      label: Smartphone Device
      description: e.g. iPhone6
      placeholder: iPhone 15
    validations:
      required: false

  - type: input
    id: mobile-os
    attributes:
      label: Smartphone OS
      description: e.g. iOS8.1
      placeholder: iOS 17.2
    validations:
      required: false

  - type: input
    id: mobile-browser
    attributes:
      label: Smartphone Browser
      description: e.g. stock browser, safari
      placeholder: Safari
    validations:
      required: false

  - type: input
    id: mobile-version
    attributes:
      label: Smartphone Browser Version
      description: e.g. 22
      placeholder: 17.2
    validations:
      required: false

  - type: textarea
    id: additional-context
    attributes:
      label: Additional context
      description: Add any other context about the problem here.
    validations:
      required: false

  - type: input
    id: default-title
    attributes:
      label: Issue default title
      description: Suggest a default title if applicable
    validations:
      required: false

  - type: input
    id: assignees
    attributes:
      label: Assignees
      description: List any suggested assignees
    validations:
      required: false

  - type: input
    id: labels
    attributes:
      label: Labels
      description: Suggest any additional labels
    validations:
      required: false
---
