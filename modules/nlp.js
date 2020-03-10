module.exports = {
  botTraining: (classifier) => {
    // Greetings
    classifier.addDocument('Hi', 'greetings');
    classifier.addDocument('Hey', 'greetings');
    classifier.addDocument('Hello', 'greetings');

    // News
    classifier.addDocument('How are u ?', 'news');
    classifier.addDocument('How are you ?', 'news');
    classifier.addDocument('What\'s up ?', 'news');
    classifier.addDocument('Hello how are you ?', 'news');
    classifier.addDocument('hi how are you ?', 'news');
    classifier.addDocument('Hey how are you ?', 'news');
    classifier.addDocument('Hi what\'s up ?', 'news');
    classifier.addDocument('Hey what\'s up ?', 'news');
    classifier.addDocument('Hello what\'s up ?', 'news');

    // Activities
    classifier.addDocument('what are you doing ?', 'activity');
    classifier.addDocument('what are u doing ?', 'activity');
    classifier.addDocument('Hey what are you doing ?', 'activity');
    classifier.addDocument('Hi what are u doing ?', 'activity');

    // Insults
    classifier.addDocument('suck me', 'gross');
    classifier.addDocument(`shut up`, 'insults');
    classifier.addDocument(`fuck you bitch !`, 'insults');
    classifier.addDocument(`go fuck yourself`, 'insults');

    // Love
    classifier.addDocument(`I love you u`, 'love');

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

    classifier.train();
  }
}
