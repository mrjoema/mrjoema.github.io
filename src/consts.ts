// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Joe Ma's Tech Blog";
export const SITE_DESCRIPTION = 'Articles, showcases, and experiments by Joe Ma.';

const raw = import.meta.env.BASE_URL;
export const BASE = raw.endsWith('/') ? raw : raw + '/';
