module.exports = function(classifier, tokenizer) {
  // Greetings
  classifier.addDocument(['hi', 'hey', 'hello'], 'greetings');

  // News
  classifier.addDocument(['how', 'you'], 'news');
  classifier.addDocument(['how', 'u'], 'news');
  classifier.addDocument(['what', 's', 'up'], 'news');

  // Activities
  classifier.addDocument(['what', 'do', 'doing'], 'activity');
  classifier.addDocument('are you busy', 'activity');
  classifier.addDocument('are u busy', 'activity');

  // Insults
  classifier.addDocument('suck me', 'gross');
  classifier.addDocument(`shut up`, 'insults');
  classifier.addDocument(`fuck you bitch !`, 'insults');
  classifier.addDocument(`go fuck yourself`, 'insults');

  // Love
  classifier.addDocument(`I love you`, 'love');

  // Weather
  classifier.addDocument('weather forecast', 'weather');

  // Thanks
  classifier.addDocument('thank u thanks you', 'thanks');

  // Jokes
  classifier.addDocument('tell me a joke', 'joke');
  classifier.addDocument('Make me laugh', 'joke');

  // Wikipedia
  classifier.addDocument('define', 'wiki');
  classifier.addDocument('search for', 'wiki');
  classifier.addDocument('Wiki Wikipedia', 'wiki');

  // Movies
  classifier.addDocument('Can I get a movie review ?', 'movie review');
  classifier.addDocument('movie review', 'movie review');

  classifier.train();
}
