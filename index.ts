import dotenv from 'dotenv';
import fs from 'fs'
import chalk from 'chalk';
import {
    IgApiClient,
    AccountFollowersFeedResponseUsersItem,
    AccountInsightsOptions
} from 'instagram-private-api';
import figlet from 'figlet';
import inquirer from 'inquirer';
dotenv.config({});

const ig = new IgApiClient();

const {
    USERNAME = '',
    PASSWORD = ''
} = process.env;

console.log(USERNAME);

const displayMessage = () => {
    console.log(chalk['red'](figlet.textSync('Instagram Crow Ahh', {horizontalLayout: 'full'})));
    console.log(chalk['green']('Author: Deri Firgiawan'))
}

const storeToJSON = (fileName: string, data: AccountFollowersFeedResponseUsersItem[], message: string) => {
    const mappedData = data.map(value => value.username);
    return fs.writeFile(fileName, JSON.stringify(mappedData, null, 2), () => {console.log(`Success Save List Data ${message}`)});
}

const login = async () => {
    return await ig.account.login(USERNAME, PASSWORD); 
}

const showPrompt = () => {

    return inquirer.prompt([{
        name: 'CHOICE_OPTIONS',
        type: 'list',
        message: 'Select your option',
        choices: [
            {name: 'Get Followers & Following', value: 'GET_FOLLOWER'},
            {name: 'Auto Unfollow', value: 'AUTO_UNFOLLOW'},
        ]
    }])
}
const main = () => {
    displayMessage();
    ig.state.generateDevice(USERNAME);
    showPrompt()
    .then(response => {
        if (response.CHOICE_OPTIONS === 'GET_FOLLOWER') {
            login().then(async (response) => {
                const followersFeed = ig.feed.accountFollowers(response.pk);
                const followingFeed = ig.feed.accountFollowing(response.pk);
                
                const items = {
                    followers: [...await followersFeed.items(), ...await followersFeed.items()],
                    following: [...await followingFeed.items(), ...await followingFeed.items()]
                }
                storeToJSON('./data/followers.json', items.followers, 'Followers');
                storeToJSON('./data/following.json', items.following, 'Following');
            }).catch(error => console.log(error));
        } else {
            login().then(async (response) => {
                const followersFeed = ig.feed.accountFollowers(response.pk);
                const followingFeed = ig.feed.accountFollowing(response.pk);
                
                const items = {
                    followers: [...await followersFeed.items(), ...await followersFeed.items()],
                    following: [...await followingFeed.items(), ...await followingFeed.items()]
                }
                const users = new Set(items.followers.map(({ username }) => username));

                // Filter User
                const userNotFollowingYou = items.following.filter(({username}) => !users.has(username));
                
                userNotFollowingYou.forEach(user => {
                    ig.friendship.destroy(user.pk);
                    console.log(chalk['yellow'](`Unfollowed: ${user.username}`));
                });
            }).catch(error => console.log(error));
        }
    })
};

main();