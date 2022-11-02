function getStereotypeIsSortal(stereotype?: String): boolean {
  if (!stereotype) {
    return false;
  }
  if (
    stereotype !== "roleMixin" &&
    stereotype !== "category" &&
    stereotype !== "phaseMixin" &&
    stereotype !== "mixin"
  ) {
    return true;
  }
  return false;
}

export { getStereotypeIsSortal };
