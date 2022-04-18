# /fs

This directory stores all the db files. This directory is only used if the environment variable `RELEASE_FILE_SYSTEM` is `true`.

If `RELEASE_FILE_SYSTEM` is `false`, then all file uploads are ignored and all file retrievals return `404.pdf`
