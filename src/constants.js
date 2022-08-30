export const CONTRACT_ADDRESS =
  '0xcCCDFECE76C47C2C57A1cb8B532d45C5402b455F';

export function transformCharacterData(characterData) {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
}
