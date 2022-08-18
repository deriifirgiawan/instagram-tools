var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';
import { IgApiClient } from 'instagram-private-api';
import figlet from 'figlet';
import inquirer from 'inquirer';
dotenv.config({});
const ig = new IgApiClient();
const { USERNAME = '', PASSWORD = '' } = process.env;
console.log(USERNAME);
const displayMessage = () => {
    console.log(chalk['red'](figlet.textSync('Instagram Crow Ahh', { horizontalLayout: 'full' })));
    console.log(chalk['green']('Author: Deri Firgiawan'));
};
const storeToJSON = (fileName, data, message) => {
    const mappedData = data.map(value => value.username);
    return fs.writeFile(fileName, JSON.stringify(mappedData, null, 2), () => { console.log(`Success Save List Data ${message}`); });
};
const login = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield ig.account.login(USERNAME, PASSWORD);
});
const showPrompt = () => {
    return inquirer.prompt([{
            name: 'CHOICE_OPTIONS',
            type: 'list',
            message: 'Select your option',
            choices: [
                { name: 'Get Followers & Following', value: 'GET_FOLLOWER' },
                { name: 'Auto Unfollow', value: 'AUTO_UNFOLLOW' },
            ]
        }]);
};
const main = () => {
    displayMessage();
    ig.state.generateDevice(USERNAME);
    showPrompt()
        .then(response => {
        if (response.CHOICE_OPTIONS === 'GET_FOLLOWER') {
            login().then((response) => __awaiter(void 0, void 0, void 0, function* () {
                const followersFeed = ig.feed.accountFollowers(response.pk);
                const followingFeed = ig.feed.accountFollowing(response.pk);
                const items = {
                    followers: [...yield followersFeed.items(), ...yield followersFeed.items()],
                    following: [...yield followingFeed.items(), ...yield followingFeed.items()]
                };
                storeToJSON('./data/followers.json', items.followers, 'Followers');
                storeToJSON('./data/following.json', items.following, 'Following');
            })).catch(error => console.log(error));
        }
        else {
            login().then((response) => __awaiter(void 0, void 0, void 0, function* () {
                const followersFeed = ig.feed.accountFollowers(response.pk);
                const followingFeed = ig.feed.accountFollowing(response.pk);
                const items = {
                    followers: [...yield followersFeed.items(), ...yield followersFeed.items()],
                    following: [...yield followingFeed.items(), ...yield followingFeed.items()]
                };
                const users = new Set(items.followers.map(({ username }) => username));
                // Filter User
                const userNotFollowingYou = items.following.filter(({ username }) => !users.has(username));
                userNotFollowingYou.forEach(user => {
                    ig.friendship.destroy(user.pk);
                    console.log(chalk['yellow'](`Unfollowed: ${user.username}`));
                });
            })).catch(error => console.log(error));
        }
    });
};
main();
