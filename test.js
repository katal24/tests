var webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');

var capabilities = {
    browserName: 'chrome',
    chromeOptions: {
        args: ['--window-size=1366,800']
    }
};

describe('Google', function() {
    this.timeout(5000);
    var driver;

    test.before(function() {
        driver = new webdriver.Builder().withCapabilities(capabilities).build();
        driver.get('http://www.google.com');
    });

    test.after(function() {
        driver.quit();
    });

    test.it('should be cheese title', function() {
        var element = driver.findElement(webdriver.By.name('q'));
        element.sendKeys('Cheese!');
        element.submit();

        driver.getTitle().then(function(title) {
            assert.equal(title, 'Cheese! - Szukaj w Google');
        });
    });

    test.it('should be 4', function() {
        let q = 4;
        assert.equal(q, 4);
    });
});