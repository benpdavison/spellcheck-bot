const spellCheck = require('./spellcheck')
module.exports = async robot => {
  // Your code here
  console.log('Yay, the app was loaded!')
  robot.on('pull_request.opened', async context => {
    // Code was pushed to the repo, what should we do with it?
    const prBody = context.payload.pull_request.body
    if (prBody) {
      console.log('checking Spelling')
      try {
        const spellCheckResult = await updateSpelling(prBody)
        const params = context.issue({body: spellCheckResult.body})
        console.log('spelling checked')
        if (spellCheckResult.replacements.length) {
          const commentParams = context.issue({body: createCommentBody(spellCheckResult.replacements), event: 'COMMENT'})
          context.github.pullRequests.createReview(commentParams)
        }
        return context.github.pullRequests.update(params)
      } catch (e) {
        console.log(e)
        console.log('No modifications made')
      }
    }
    console.log('finished')
  })
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}

const updateSpelling = async function (prBody) {
  let newBody = prBody
  const replacements = []
  newBody = newBody.replace(/\r?\n/g, '   ')
  const response = await spellCheck(newBody)
  const flaggedTokens = JSON.parse(response).flaggedTokens
  console.log(prBody)
  console.log(response)
  for (const flaggedToken of flaggedTokens) {
    replacements.push({'original': flaggedToken.token, 'new': flaggedToken.suggestions[0].suggestion})
    newBody = newBody.replace(flaggedToken.token, flaggedToken.suggestions[0].suggestion)
  }
  newBody = newBody.split(/\s{3}/g).join('\n')
  return {'body': newBody, 'replacements': replacements}
}

const createCommentBody = function (replacements) {
  let commentBody = 'SpellCheck Bot detected spelling mistakes and replaced the following words: \n'
  for (const replacement of replacements){
    commentBody += `\`${replacement.original}\` => \`${replacement.new}\`\n`
  }
  return commentBody
}
