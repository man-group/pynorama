import React from 'react'

export function calculateLevelLengths(node, getChildren) {
  let levelLengths = [];
  let levelNodes = [node];

  let counter = 0;
  let nextLevelNodes = [];

  while (levelNodes.length > 0) {
    levelLengths[counter] = levelNodes.length;

    nextLevelNodes = [];
    for (let levelNode of levelNodes) {
      if (getChildren(levelNode))
        nextLevelNodes.push(...getChildren(levelNode));
    }
    levelNodes = nextLevelNodes;
    ++counter;
  }

  return levelLengths;
}
