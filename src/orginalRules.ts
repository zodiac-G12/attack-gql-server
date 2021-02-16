// SelectionSet: https://www.apollographql.com/blog/the-anatomy-of-a-graphql-query-6dffa9e9e747/

export const selectionCount = (selectionSet: any): number => {
  return selectionSet ? (JSON.stringify(selectionSet).match(new RegExp("selections", "g")) || []).length : 0;
}

export const complexityCal = (selectionSet: any): number => {
  return selectionCount(selectionSet);
}

// DISABLE disallowCycle -> INVALID: author -> books -> shops -> authors -> books -> shops
// DISABLE disallowPattern -> INVALID: author -> books -> (shops -> countries) -> authors -> shops -> books -> (shops -> countries)
const loopCheck = (beforeName, selectionSet, transitionReference, disallowCycle, disallowPattern) => {
  if (!selectionSet) {
    return true;
  }

  const nowName = selectionSet.selections[0].name.value;
  if (disallowPattern && beforeName && nowName) {
    if (!transitionReference[beforeName]) {
      transitionReference[beforeName] = [];
    }
    if (!transitionReference[beforeName].includes(nowName)) {
      transitionReference[beforeName].push(nowName);
    } else {
      throw new Error(`Pattern is Already Exist: ${beforeName} -> ${nowName}`);
    }
  }

  const nextName = selectionSet.selections[0].selectionSet?.selections[0].name.value;

  console.log(beforeName, nowName, nextName, selectionSet.selections[0])
  if (disallowCycle && beforeName === nextName) {
    throw new Error(`This is Looped Evil Query: beforeName: ${beforeName}, nowName: ${nowName}, nextName: ${nextName}`);
  }
  return loopCheck(nowName, selectionSet.selections[0].selectionSet, transitionReference, disallowCycle, disallowPattern);
}

export const orginalRules = (info, disallowCycle, disallowPattern) => {
  return loopCheck(info.fieldNodes[0].name.value, info.fieldNodes[0].selectionSet, {}, disallowCycle, disallowPattern);
}
