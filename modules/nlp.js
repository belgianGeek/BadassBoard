const nlp = require('natural');
nlp.classifier = new nlp.LogisticRegressionClassifier();
nlp.tokenizer = new nlp.WordTokenizer();

const botTraining = require('./botTraining');
botTraining(nlp.classifier, nlp.tokenizer);

nlp.LogisticRegressionClassifier.load('classifier.json', null, function(err, loadedClassifier) {
  if (!err) {
    console.log('Classifier successfully loaded !');
    nlp.classifier = loadedClassifier;
  } else {
    if (err.code !== 'ENOENT') {
      console.log(`Error calling classifier : ${JSON.stringify(err, null, 2)}`);
    }
  }
});

module.exports = nlp;
