const process =require('process')
const minimist= require('minimist')
const { Web3Storage, getFilesFromPath } =require( 'web3.storage')
require('dotenv').config()
async function main () {
  const args = process.env.args
  const token = process.env.filecoin_API_KEY

  if (!token) {
    return console.error('A token is needed. You can create one on https://web3.storage')
  }

  if (args.length < 1) {
    return console.error('Please supply the path to a file or directory')
  }

  const storage = new Web3Storage({ token })
  const files = []

    console.log(args)
    const pathFiles = await getFilesFromPath(args)
    files.push(...pathFiles)

  console.log(files)
  console.log(`Uploading ${files.length} files`)
  const cid = await storage.put(files)
  console.log('Content added with CID:', cid)
}

main()
