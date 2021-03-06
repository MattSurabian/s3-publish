
# s3-publish

[![npm version](https://badge.fury.io/js/s3-publish.svg)](https://badge.fury.io/js/s3-publish)

The s3-publish package provides the `s3p` command which can be used to list local/remote files and sync them to S3.

Options may be specified in an **s3p.config.js** file in your project root and/or on the command line
(command line arguments take precedent).

Asynchronous publishing rules can be defined as JavaScript functions for maximum control when processing files.

This project does not aim to replace general purpose S3 clients like
[AWS CLI](https://aws.amazon.com/cli/) or [node-s3-cli](https://github.com/andrewrk/node-s3-cli).
It is focused on facilitating granular control over specific tasks like deploying static sites to S3.

## Installation

    npm install -g s3-publish
    
## Quick Start

For this example, we'll create a bucket named **s3p-test** and a local folder named **www** that contains a single
text file named **A.txt**.

    aws s3 mb s3://s3p-test
    mkdir www
    echo "Test file content" > www/A.txt
    
Run the `init` command to create an **s3p.config.js** file in the current working directory:

    s3p init --origin ./www --destination s3://s3p-test

Run the `ls` command to test the config (the list of origin files should be displayed, currently only **A.txt**):

    s3p ls

Run the `sync` command to preview changes
(press enter when prompted to upload **A.txt** to the destination S3 bucket):

    s3p sync
    
If you run the `sync` command again, nothing will be uploaded because **A.txt** has not changed
(by default the MD5 checksum is compared).
Edit the **A.txt** file before re-running `sync` or use the `--change` flag to upload unchanged files.

You've mastered the basics! Next steps usually include editing the **s3p.config.js** file to specify
options like a global ignore pattern and any special handling rules.
See [examples](https://github.com/adamjarret/s3-publish/tree/master/examples) for more information.

## Commands

### init

    s3p init [options]
    
Use the `init` command to create an **s3p.config.js** file in the current working directory.
Any options passed to this command are set in the generated file.

### ls

    s3p ls [options] [LocalPath or S3Uri]...
    
Use the `ls` command to list files in a local directory or an S3 bucket.
One or more locations may be passed as unnamed arguments. 

If no location arguments are passed to `ls`, files in the origin location are listed
(the origin defaults to the current working directory if not defined).
If `-o` (aka `--here`) and/or `-d` (aka `--there`) is passed, that/those locations are listed
(in addition to any locations specified as unnamed arguments).

The `ignore` pattern/function (if defined) is applied to files listed by `ls`. To temporarily disable the `ignore`
option and list all files, pass `-a` (aka `--all` or `--no-ignore`).

### sync 

    s3p sync [options] [origin] [destination]

Use the `sync` command to analyze files in the origin and destination and recursively copy new and changed files.
The origin and destination locations may be passed as unnamed arguments (in that order).

Pass `--delete` (or set `delete: true` in config file) to delete files from destination that do not exist in origin.

Pass `-y` (or set `yes: true` in config file) to perform the operations without prompting.

See below for all options.

## Options

Single character aliases for options should be used on the command line only
(ex. to always skip the confirmation prompt, set `yes: true` in your config; setting `y: true` has no effect).

The `rules` option can only be defined in the config file.
Non-string values for `ignore` must be defined in the config file.

If a boolean value defaults to `true` or is set to `true` in the config file,
it can be overridden on the command line by adding a `no-` prefix (ex. `--no-add`).

Run `s3p init -?` to see all options and defaults. If a config file is present, the default
values on this screen reflect the values set in the config file.

### profile

Use a specific profile from your AWS CLI credential file.

`[String] default: 'default'`

### region

Specify the [AWS region](http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region) to use.

`[String] default: 'us-east-1'`

### origin

Specify the local path of directory to be synced.

`[String] default: process.cwd()`

### destination

Specify the S3 URI of the bucket where files should be uploaded (ex. s3://s3p-test).
May include a prefix (ex. s3://s3p-test/foo).

`[String] default: undefined`

### ignore

Files matching this value are ignored.

If a **string** is specified, it is treated as a glob pattern and is matched against the file `Key`
(using [minimatch](https://github.com/isaacs/minimatch)).
Values provided via the `--ignore` command line argument are interpreted as strings.

If a **regular expression** is specified, it is matched against the file `Key`.

If a **function** is specified, it is invoked with `(file, callback)` and is expected to callback with any error
(or `null` if none was encountered) and a boolean value (`true` to ignore, otherwise `false`): `callback(null, true)`

`[String|RegEx|Function] default: undefined`

### all, -a

Disable ignore (list/sync all files). Equivalent to `--no-ignore`.

`[Boolean] default: false`

### porcelain, -u

Display file sizes in bytes, dates as ISO 8601 and durations in milliseconds.

`[Boolean] default: false`

### here, -o

List files in origin.
Only relevant to `ls` command.

`[Boolean] default: false`

### there, -d

List files in destination.
Only relevant to `ls` command.

`[Boolean] default: false`

### acl

Use [putObjectAcl](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObjectAcl-property) instead of
[putObject](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).
See the [AWS documentaion](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUTacl.html) for more information.

`[Boolean] default: false`

### concurrency, -m

Specify the number of uploads to execute simultaneously.

`[Integer] default: 1`

### debug

Print request params to stdout.
Note: The `Body` param is a `Stream` object. The path to the file being streamed is displayed for the sake of clarity.

`[Boolean] default: false`

### no, -n

Preview operations without performing them or prompting (dry run).

`[Boolean] default: false`

### yes, -y, -f

Perform operations without prompting.

`[Boolean] default: false`

### add

Upload origin files that do not exist in destination.

`[Boolean] default: true`

### change

Upload unchanged files (ignore compare result, all non-ignored files will be uploaded).

`[Boolean] default: false`

### delete

Delete destination files that do not exist in origin.

`[Boolean] default: false`

### rules

Specify an array of rule objects to apply. If a rule defines a `pattern` property, it only applies to files with a
`Key` that matches the pattern. Rules are applied in the order they appear in the array.
The result from the previously applied rule is passed to the next rule.
The first rule to be applied is passed the value that would be used if no rules were defined.

See [examples](https://github.com/adamjarret/s3-publish/tree/master/examples) for more information.

`[Array] default: undefined`

## Rule Object

Rule objects with the following structure can be defined to implement special handling of certain files
(all properties are optional):

    {
        pattern: [RegEx],
        alternateKey: [Function],
        compare: [Function],
        putParams: [Function]
    }

`pattern` is a regular expression. If defined, the rule is only applied to origin files with a `Key` that matches.

`alternateKey` is a function with the signature `(file, key, callback)`. If defined, it is expected to callback with
any error (or `null` if none was encountered) and the destination key for a given origin file.
This can be used to associate an origin file with a destination file that has a different key for the purposes of 
comparison and generating PUT parameters (effectively "renaming" files on their way to S3).

`compare` is a function with the signature `(fileA, fileB, changed, callback)`.
If defined, it is expected to callback with any error (or `null` if none was encountered) and a boolean value
indicating whether fileA is different from fileB (`true` if changed, otherwise `false`).
This can be used to compare files based on something other than the `ETag` (MD5 checksum) which is checked by default.

`putParams` is a function with the signature `(file, params, callback)`.
If defined, it is expected to callback with any error (or `null` if none was encountered) and the params that should be 
passed to `putObject` (or `putObjectAcl` if the `acl` option is `true`).
This can be used to modify the request params before a file is sent to S3.

See [examples](https://github.com/adamjarret/s3-publish/tree/master/examples) for more information.

## File Object

Rule functions (and the `ignore` function if defined) receive one or more File objects as arguments.
File objects have the following structure:

    {
        Key: [String],
        ETag: [String],
        LastModified: [Date],
        Size: [Integer]
    }

`Key` is the file path (relative to origin/destination).

`ETag` is the quoted MD5 checksum of the file.

`LastModified` is the file modification date.

`Size` is the file size in bytes.