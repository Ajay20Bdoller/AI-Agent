import {config} from "dotenv";

import { TwitterApi} from "twitter-api-v2";


config();

// console.log("API Key:", process.env.TWITTER_API_KEY);
// console.log("API Secret:", process.env.TWITTER_API_SECRET);
// console.log("Access Token:", process.env.TWITTER_ACCESS_TOKEN);
// console.log("Access Secret:", process.env.TWITTER_ACCESS_TOKEN_SECRET);


const twitterClient = new TwitterApi({

apiKey:process.env.TWITTER_API_KEY,
apiSecret:process.env.TWITTER_API_SECRET,
accessToken:process.env.TWITTER_ACCESS_TOKEN,
accessTokenSecret:process.env.TWITTER_ACCESS_TOKEN_SECRET

});

const rwClient = twitterClient.readWrite;

export async function createPost(status){

const newPost = await twitterClient.v1.tweet(status)

return{

  content: [
    {
      type: "text",
      text: `Tweeted: ${newPost.data.text}`,
    },
  ],
  status: newPost.data,
}


}


