const execSync = require('child_process').execSync
const TRAVIS_BRANCH = process.env['TRAVIS_BRANCH'] || 'unknown branch'
const KEY_NAME = 'blog'
const BUILD_FOLDER = 'dist'

if (/master|feature|develop/.test(TRAVIS_BRANCH)) {
    try {
        console.log(`Deploying site from branch ${TRAVIS_BRANCH}`)

        const TRAVIS_BUILD_DIR = process.env['TRAVIS_BUILD_DIR']
        const DEPLOY_HOST = process.env['DEPLOY_HOST']
        const DEPLOY_PORT = process.env['DEPLOY_PORT']
        const DEPLOY_USER = process.env['DEPLOY_USER']
        const RSYNC_COMMAND = `rsync -e "ssh -oStrictHostKeyChecking=no -i ${TRAVIS_BUILD_DIR}/${KEY_NAME} -p ${DEPLOY_PORT}" --delete -avr ${TRAVIS_BUILD_DIR}/${BUILD_FOLDER} ${DEPLOY_USER}@${DEPLOY_HOST}:${TRAVIS_BRANCH}`

        var command = execSync(RSYNC_COMMAND)
        console.log(`rsync command completed with ${command}`)
        process.exit(0)

    } catch (error) {
        console.error('error with the rsync command')
        console.error(error)
        process.exit(1)
    }
} else {
    console.log(`Not deploying ${TRAVIS_BRANCH} branch`)
    process.exit(0)
}
