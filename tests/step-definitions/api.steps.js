const jestCucumber = require('jest-cucumber');

let request = require('supertest');
request = request('http://localhost:3000');

const defineFeature = jestCucumber.defineFeature;
const loadFeature = jestCucumber.loadFeature;

const feature = loadFeature('tests/features/api.feature');



defineFeature(feature, test => {

    let response;
    
    test('Login', ({ given, when, then }) => {
        given('I am not logged in', async () => {
            response = await request.get('/rest/login')
            expect(response.status).toEqual(403);
            expect(response.body.loggedIn).toBeFalsy();
        });

        when(/^I send a post request to login with correct credentials "(.*)" and "(.*)"$/, async (arg0, arg1) => {
            response = await request.post('/rest/login').send({email: "ben@node.se", password: "abc123"})            
        });

        then('I recieve a response that I am logged in', async () => {
            expect(response.status).toEqual(200);
            expect(response.body.loggedIn).toBeTruthy();
        });
    });

    test('CheckLogin', ({ given, when, then }) => {
        given('I am logged in', async () => {

        });

        when('I send a get request to login', async () => {
                      
        });

        then('I recieve a response that I am logged in', async () => {
           
        });
    });

    test('Logout', ({ given, when, then }) => {
        given('I am logged in', async () => {

        });

        when('I send a delete request to login', async () => {
          
        });

        then('I recieve a response that I am logged out', async () => {

        });
    });

});