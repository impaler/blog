const execSync = require('child_process').execSync
const path = require('path')
const parentStdio = {stdio:[0,1,2]}

const CD_BLOG_NAME = 'christopherdecoster.com'
const HOST_BUILD_DIR = path.resolve(__dirname, '..')
const CONTAINER_BUILD_DIR = '/home/node/cd-blog-phenomic'
const MOUNT_CONTENT_ARGS = `-v ${HOST_BUILD_DIR}/assets:${CONTAINER_BUILD_DIR}/content/assets -v ${HOST_BUILD_DIR}/posts:${CONTAINER_BUILD_DIR}/content/posts`

if (process.argv.indexOf('watch') > -1)
    watch()
else if (process.argv.indexOf('build') > -1)
    build()
else if (process.argv.indexOf('buildImage') > -1)
    buildImage()

else {
    console.error(`
Unknown run argument, you can use:
    node/scripts/run.js buildImage // build the docker image, use CLEAR_CACHE to invalidate docker cache
    node/scripts/run.js build // build production site to dist folder
    node/scripts/run.js watch // run the watch task for writing blog posts
`)
    process.exit(1)
}

function watch() {
    execSync(`docker run -ti ${MOUNT_CONTENT_ARGS} --rm ${CD_BLOG_NAME} yarn start`, parentStdio)
}

function build() {
    execSync(`rm -rf ${HOST_BUILD_DIR}/dist`, parentStdio)
    execSync(`mkdir ${HOST_BUILD_DIR}/dist`, parentStdio)

    const buildCommand = 'yarn build'

    execSync(`docker run --user $(id -u) ${MOUNT_CONTENT_ARGS} -v ${HOST_BUILD_DIR}/dist:${CONTAINER_BUILD_DIR}/dist ${CD_BLOG_NAME} ${buildCommand}`, parentStdio)
}

function buildImage() {
    // allow the clearing of cache by env setting
    const cache = !!process.env.CLEAR_CACHE ? '--no-cache' : ''

    // replace any existing build, content is separated so no big deal about env
    tryToRemoveImage(CD_BLOG_NAME)

    execSync(`docker build -t ${CD_BLOG_NAME} . ${cache}`, Object.assign({cwd:__dirname}, parentStdio) )
}

function tryToRemoveImage(imageName) {
    try {
        execSync(`docker rm -f ${imageName}`)
    } catch(error) {
        // swallow error for:
        // Error response from daemon: No such container: ...
    }
}