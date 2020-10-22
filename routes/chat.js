const axios = require('axios');
const os = require('os');
const rottenParser = require('../modules/rottenParser');
const nlp = require('../modules/nlp');
const customize = require('../modules/customize');
const Reply = require('../modules/reply');

// Get current the logged in user name
let username = os.userInfo().username;

let replyID = 0;
// Define the user request theme to avoid training the bot with unecessary data
// like city names or stupid stuff (msgTheme == 'function' in that case)
let msgTheme = 'none';

module.exports = function(app, io, settings) {
  app.get('/chat', (req, res) => {
    // Define emoijis
    let emoijis = {
      devil: '😈',
      expressionless: '😑',
      innocent: '😇',
      laugh: '😂',
      sad: '😭',
      smile: '😃',
      sunglasses: '😎',
      wink: '😉'
    }

    res.render('chat.ejs', {
      botName: settings.bot.name,
      currentVersion: app.tag,
      isHomepage: false,
      wallpaper: settings.backgroundImage
    });

    io.once('connection', io => {
      let reply = '';

      // Do not send the default wallpaper
      if (settings.backgroundImage !== './src/scss/wallpaper.jpg') {
        io.emit('wallpaper', settings.backgroundImage);
      }


      if (settings.bot !== undefined) {
        if (settings.bot.icon !== undefined && settings.bot.icon !== './src/scss/icons/interface/bot.png') {
          io.emit('bot avatar', settings.bot.icon);
        }
      }

      // Send the username to the frontend
      io.emit('username', username.capitalize());

      let welcomeMsg = new Reply(`Hi ! I'm ${settings.bot.name}, how can I help you ?`, io, settings, replyID, msgTheme).send();

      io.on('chat msg', msg => {
        const tokenize = (msg) => nlp.classifier.getClassifications(nlp.tokenizer.tokenize(msg.toLowerCase()));

        const getWeatherForecast = (msg) => {
          // Strip accents and diacritics
          let location = msg.normalize('NFD');
          let url = `https://api.openweathermap.org/data/2.5/find?q=${location}&units=metric&lang=en&appid=${settings.owmToken}`;

          axios({
              url: url,
              method: 'GET'
            })
            .then(res => {
              let result = res.data;
              let count = result.count;

              if (count !== 0) {
                let previsions = {
                  temp: result.list[0].main.temp,
                  city: result.list[0].name,
                  description: result.list[0].weather[0].description,
                  humidity: result.list[0].main.humidity,
                  windSpeed: result.list[0].wind.speed
                };

                msgTheme = 'weather';

                return new Reply(`Currently in ${previsions.city}, the temperature is ${previsions.temp} C°, ${previsions.description}. ` +
                  `Humidity is about ${previsions.humidity}%, and the wind blows at ${previsions.windSpeed} km/h.`, io, settings, replyID, msgTheme).send();
              } else {
                msgTheme = 'weather';
                return new Reply("Sorry, I can't find this place... Make sure of the location you have given me and retry...", io, settings, replyID, msgTheme).send();
              }
            })
            .catch(err => {
              console.log(`Error getting weather forecast : ${err}`);
            });
        }

        const revertGreetings = (msg) => {
          if (msg.content.match(/(how are (you|u)|what's up)/gi)) {
            reply = `I'm fine. What about you ?`;
            msgTheme = 'news';

            io.on('chat msg', msg => {
              msgTheme = 'news';

              let answers = [
                'Nice to hear !',
                'Great !'
              ];

              reply = answers.random();
            });
          } else {
            reply = `Hey ${msg.author} ! What can I do for you ?`;
            msgTheme = 'greetings';

            io.on('chat msg', msg => {
              if (msg.content.match(/nothing/i)) {
                reply = new Reply('Ok then, I\'ll leave you alone.', io, settings, replyID, msgTheme).send();
              }
            });
          }
        }

        const searchWiki = (args, msg) => {
          return new Promise((fullfill, reject) => {
            axios({
                url: `https://en.wikipedia.org/api/rest_v1/page/summary/${args.join('_')}?redirect=true`,
                method: 'GET'
              })
              .then(res => {
                const body = res.data;

                // Check if the API entry exists
                if (!body.title.match(/not found/gi)) {
                  let reply = {
                    icon: './src/scss/icons/suggestions/wikipedia.ico',
                    title: body.title,
                    url: body.content_urls.desktop.page,
                    color: 'white',
                    description: `<p>According to Wikipedia,</p> <article><i>${body.extract}</i></article>`
                  };

                  if (body.type === 'disambiguation') {
                    reply.description += `<p>A disambiguation page is available here : <a href="${reply.url}">${body.title}</a></p>`;
                  } else {
                    reply.description += `<p>More info : <a href="${reply.url}">${body.title}</a></p>`;
                  }

                  if (body.thumbnail !== undefined) {
                    reply.img = body.thumbnail.source;
                  }

                  // Modify the message theme to create the embed
                  msgTheme = 'wiki';
                  reply.theme = 'wiki';

                  fullfill(reply);
                } else {
                  reject(`Sorry ${msg.author}, Wikipedia does not have any entry for this...`);
                }
              })
              .catch(err => {
                console.log(`Error parsing Wikipedia API : ${err}`);
                reject(`Sorry, ${msg.author}, I was unable to complete your request. Please check the logs for details.`);
              });
          });
        }

        const wikiResponse = (args, msg) => {
          searchWiki(args, msg)
            .then(res => {
              new Reply(res, io, settings, replyID, msgTheme).send();
            })
            .catch(err => {
              new Reply(err, io, settings, replyID, msgTheme).send();
            })
        }

        if (tokenize(msg.content)[0].value > 0.5) {
          if (nlp.classifier.classify(msg.content) === 'greetings') {
            revertGreetings(msg);
          } else if (nlp.classifier.classify(msg.content) === 'weather') {
            reply = `Which city do you want to get the forecast for ?`;
            msgTheme = 'weather';

            io.on('chat msg', msg => {
              reply = getWeatherForecast(msg.content);
              return;
            });
          } else if (nlp.classifier.classify(msg.content) === 'news') {
            revertGreetings(msg);
          } else if (nlp.classifier.classify(msg.content) === 'activity') {
            reply = `I'm just talking to you ${msg.author}.`;
            msgTheme = 'activity';
          } else if (nlp.classifier.classify(msg.content) === 'love') {
            let answers = [
              `Sorry ${msg.author}, I don't think human and robots can love each other...`,
              `Welcome to the Friendzone dude !`,
              `Forgive me but I can't express any feelings`
            ];

            reply = answers.random();
            msgTheme = 'love';
          } else if (nlp.classifier.classify(msg.content) === 'gross') {
            let answers = [
              `Don't be so gross ${msg.author} !`,
              `I'm not equiped for that kind of... activity, sorry.`,
              `What if I told you to go fuck yourself ${msg.author} ?`,
            ];

            reply = answers.random();
            msgTheme = 'gross';
          } else if (nlp.classifier.classify(msg.content) === 'insults') {
            let answers = [
              `Didn't you Mother teach you politeness ?`,
              `So you think you're better than me ? Interesting...`
            ];

            reply = answers.random();
            msgTheme = 'insults';
          } else if (nlp.classifier.classify(msg.content) === 'thanks') {
            let answers = [
              `You're welcome ${msg.author} !`,
              `Glad I could help you !`,
              `Now you owe me one ${emoijis.innocent}`,
            ];

            reply = answers.random();
            msgTheme = 'thanks';
          } else if (nlp.classifier.classify(msg.content) === 'joke') {
            reply = `I don't have any jokes for now...`;
            msgTheme = 'joke';
          } else if (nlp.classifier.classify(msg.content) === 'wiki') {
            let args = msg.content.split(' ');
            msgTheme = 'wiki';

            if (msg.content.match(/^define/i)) {
              args.shift();
              wikiResponse(args, msg);
            } else if (msg.content.match(/^search for/i)) {
              args.splice(0, 2);
              wikiResponse(args, msg);
            } else {
              reply = `Sorry ${msg.author}, I couldn't understand... What are you searching for ?`;

              io.on('chat msg', msg => {
                let args = msg.content.split(' ');
                wikiResponse(args, msg);
              });
            }
          } else if (nlp.classifier.classify(msg.content) === 'movie review') {
            let answers = [
              `Which movie do you want a review for ?`,
              `Which movie are you interested in ?`
            ];

            reply = answers.random();

            io.on('chat msg', msg => {
              let args = msg.content.split(' ');

              rottenParser.getMovieReview(msg.content)
                .then(movieData => {

                  let reply = {
                    title: movieData.title,
                    img: movieData.poster,
                    url: movieData.url,
                    description: `<u>Synopsis</u> : ${movieData.synopsis}`,
                    fields: [
                      `<u>Rating</u> : ${movieData.rating}`,
                      `<u>Critics consensus</u> : ${movieData.consensus}`
                    ]
                  };

                  if (!movieData.rating.match(/No rating found/i)) {
                    if (movieData.rating > '80%') {
                      reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/cf-lg.3c29eff04f2.png';
                      reply.color = 'gold';
                    } else if (movieData.rating > '50%' && movieData.rating < '80%') {
                      reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/new-fresh-lg.12e316e31d2.png';
                      reply.color = 'red';
                    } else {
                      reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/new-rotten-lg.ecdfcf9596f.png';
                      reply.color = 'green';
                    }
                  } else {
                    reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/new-fresh-lg.12e316e31d2.png';
                    reply.color = 'red';
                  }


                  msgTheme = 'movie review';

                  new Reply(reply, io, settings, replyID, msgTheme).send();
                })
                .catch((err) => {
                  console.log(err);
                  let link = `https://www.rottentomatoes.com/search/?search=${args.join(' ')}`;
                  let linkTag = `<a class="embed__link" href="${link}">${link}</a>`;

                  new Reply(
                    `Sorry, I couldn't get this movie review... ${emoijis.expressionless} \n` +
                    `Please try again using another keywords or go to this results page : ${linkTag}`,
                    io, settings, replyID, msgTheme
                  ).send();
                });
            });
          }
        } else if (tokenize(msg.content)[0].value === 0.5) {
          reply = `Sorry, I didn't understand you because I'm not clever enough for now...`;
        }

        // Check if the reply is not empty before sending it
        if (reply !== '') {
          let answer = new Reply(reply, io, settings, replyID, msgTheme).send();

          let content = nlp.tokenizer.tokenize(msg.content);

          // Add the last user message to nlp.classifier and train the bot with it
          if (tokenize(msg.content)[0].value !== 'none') {
            nlp.classifier.addDocument(content, msgTheme);
            nlp.classifier.train();

            // Save the nlp.classifier for further usage
            nlp.classifier.save('classifier.json', function(err, classifier) {
              if (err) {
                console.log(`Error saving changes to the nlp.classifier : ${err}`);
              }
            });
          } else {
            console.log(`The message "${msg.content}" was not classified because it didn't have a valid class...`);
          }
        }
      });

      io.on('customization', customizationData => {
        customize(io, settings, customizationData);
      });
    })
  });
}
