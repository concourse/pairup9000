import React from 'react';
import { render } from 'react-dom';
import App from './App';

let state = {
  assignments: {
    "0": ["julz", "zhou"],
    "1": ["george", "alberto"],
    "2": ["georgi"],
    "out": ["will", "svett", "gareth"],
  },
  tracks: [
    "0", "1", "2", "3", "4",
  ],
  trackNames: {
    "0": "Track One",
    "1": "Track Two",
    "2": "Track Three",
  },
  badges: {
    "1": [ "CI" ],
  },
  photos: {
    "julz": "https://avatars2.githubusercontent.com/u/354013?v=3&s=72",
    "svett":"https://avatars1.githubusercontent.com/u/703323?s=72" ,
    "zhou": "https://avatars3.githubusercontent.com/u/4571626?v=3&s=72",
    "georgi": "https://avatars1.githubusercontent.com/u/9860469?v=3&s=72",
    "gareth": "https://avatars3.githubusercontent.com/u/918129?v=3&s=72",
    "george": "https://avatars1.githubusercontent.com/u/1753414?v=3&s=72",
    "will": "https://avatars3.githubusercontent.com/u/1255755?v=3&s=72",
    "alberto": "https://avatars1.githubusercontent.com/u/15064?v=3&s=72",
  },
  locked: { "julz": true },
  version: 0,
}


const onDrop = function(card, track) {
  assign(card, track)

  // re-render
  r()

  // post back
  post()
}

const assign = function(card, track) {
  // remove existing
  Object.keys(state.assignments).forEach( k => {
    state.assignments[k] = state.assignments[k].filter( a => a != card )
  })

  // add back
  state.assignments[track] = (state.assignments[track] || []).concat(card)
}

const onTrackNameChanged = function(id, name) {
  state.trackNames[id] = name
  r()
  post()
}

const onBadgeAssigned = function(track, badge) {
  Object.keys(state.badges).forEach( k => {
    state.badges[k] = state.badges[k].filter( a => a != badge )
  })

  state.badges[track] = (state.badges[track] || []).concat(badge)

  r()
  post()
}

const onToggleLock = function(card) {
  state.locked[card] = !state.locked[card]
  r()
  post()
}

const randomize = function() {
  state.tracks.forEach(track => {
    (state.assignments[track] || []).filter(card => !state.locked[card]).forEach(card => assign(card, "available"))
  })

  while(state.assignments["available"].length > 0) {
    let trackWithLowestAssigned = state.tracks[0]
    state.tracks.forEach(track => {
      if(state.trackNames[track]) {
        if((state.assignments[track] || []).length < (state.assignments[trackWithLowestAssigned] || []).length) {
          trackWithLowestAssigned = track
        }
      }
    })

    const randomChoice = Math.floor(Math.random() * state.assignments["available"].length)
    assign(state.assignments["available"][randomChoice], trackWithLowestAssigned)
  }
}

function r() {
  let a = {}
  Object.keys(state.assignments).forEach( track => {
    a[track] = state.assignments[track].map( card => {
      return { name: card, photo: state.photos[card], locked: state.locked[card], onToggleLock: () => onToggleLock(card) }
    })
  })

  render((<App
        tracks={state.tracks}
        trackNames={state.trackNames}
        assignments={a}
        badges={state.badges}
        onCardDropped={onDrop}
        onCardHovered={x => x}
        onTrackNameChanged={onTrackNameChanged}
        onBadgeAssigned={onBadgeAssigned}
        randomize={randomize}
      />), document.getElementById('root'));
}

function refresh() {
  fetch('/state.json').then(resp => resp.json()).then(json => {
    if (Object.keys(json).length > 0 && json.version > state.version) {
      state = json
    }

    r()

    window.setTimeout(refresh, 500)
  }).catch(error => {
    window.setTimeout(refresh, 500)
  })
}

function post() {
  state.version = state.version + 1;
  fetch('/state.json', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state),
  })
}


refresh()
