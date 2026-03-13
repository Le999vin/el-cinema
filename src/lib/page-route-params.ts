export type PageRouteParamsInput<T extends Record<string, string>> = T | Promise<T> | undefined;

export const resolvePageRouteParams = async <T extends Record<string, string>>(
  params: PageRouteParamsInput<T>,
): Promise<T> => {
  return ((params ? await params : {}) as T);
};
