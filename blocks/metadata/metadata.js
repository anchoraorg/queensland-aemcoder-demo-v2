export default function decorate(block) {
  const parent = block.closest('.section');
  if (parent) {
    parent.remove();
  }
}
