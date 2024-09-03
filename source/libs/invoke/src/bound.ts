export function bound<C extends object, T extends (...args: any[]) => any>(
  target: T,
  context: ClassMethodDecoratorContext<C, T>,
) {
  context.addInitializer(function () {
    Object.defineProperty(target, 'name', { value: target.name })
  })
}
