Feature: Authentication

    "As a user I want to be able to have authenticated access"

    Scenario: Login
        Given I am not logged in
        When I send a post request to login with correct credentials "ben@nodehill.com" and "abc123"
        Then I recieve a response that I am logged in

    Scenario: CheckLogin
        Given I am logged in
        When I send a get request to login 
        Then I recieve a response that I am logged in


    Scenario: Logout
        Given I am logged in
        When I send a delete request to login
        Then I recieve a response that I am logged out
