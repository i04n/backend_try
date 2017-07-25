import { settings } from './settings';

export function addAuthFetch(f=null) {
  return (state) => {
    let original_result = {};
    if (f !== null) {
      original_result = f(state)
    }

    return {
      fetchAuth: (input, init={}) => {
        return fetchAuth(state.authToken, input, init);
      },
      ...original_result
    };
  }
}

export function fetchAuth(authToken, input, init={}) {
  input = settings.endpoint + input;
  if (!init.headers) {
    init.headers = {}
  }
  init.headers.Authorization = `Token ${authToken}`;
  return fetch(input, init)
}

export function navigatorLanguage() {
  // Define user's language. Different browsers have the user locale defined
  // on different fields on the `navigator` object, so we make sure to account
  // for these different by checking all of them
  const language = (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage;

  return language.toLowerCase().split(/[_-]+/)[0];
}