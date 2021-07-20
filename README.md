# allegro-actions/require-issue

This action ensures that there is a valid existing issue in commit message.

## Basic usage:

```
steps:
  - uses: allegro-actions/require-issue@v1
    with:
      host: jira.allegro
      token: jira personal-access-token
```

## Inputs

`type` - type of issue tracker - default - `jira`
