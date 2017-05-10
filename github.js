'use strict';

const axios = require('axios');

// TODO: DON'T COMMIT THIS TOKEN
const GITHUB_API_KEY = '9fc5c1f175c4bedc1f4d29a88cd9e1c3094914d6';
const ORG_USER = 'vcarl'
const REPO = 'dotfiles'

const { exclude } = require('./package.json');

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_API_KEY}`
  }
})

const getPRsToMerge = (owner, repo) => {
  // TODO: (owner, repo) => Promise<Open PRs without X label>
  new Promise((resolve, reject) => {
    const prsURL = `/repos/${owner}/${repo}/pulls`
    const labelURL = number => `/repos/${owner}/${repo}/issues/${number}`

    const getPRsWithLabels = () =>
      getPRs()
        .then(attachAllLabels)

    const getPRs = () => github.get(prsURL)

    const attachAllLabels = ({data: pulls}) =>
      Promise.all(pulls.map(pull => addPRLabels(pull)))

    const addPRLabels = (pull) =>
      github.get(labelURL(pull.number))
        .then(({data: labels}) => pull.labels = labels)

    // TODO: filter out labels from packacge.json[exclude]
    getPRsWithLabels()
      .then(pulls => pulls.filter())
  })
}
