var webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
var args = require('command-line-args');
var screenshot = require('node-screenshot');
var mysql = require('mysql');

var capabilities = {
    browserName: 'chrome',
    chromeOptions: {
        args: ['--window-size=1366,800', '--disable-application-cache']
    }
};

var optionDefinitions = [{
        name: 'sc',
        type: Number
    },
    {
        name: 'tc',
        type: Number
    },
    {
        name: 'all',
        type: Boolean
    }
];

var options = args(optionDefinitions, {
    partial: true
});
var driver;
var connection;

if (options.all || options.sc === 1) {
    describe('LogIn page', function() {
        this.timeout(50000);

        test.beforeEach(function() {
            driver = new webdriver.Builder().withCapabilities(capabilities).build();
            driver.get('http://localhost:8000');
        });

        test.afterEach(function() {
            driver.quit();
        });

        if (options.all || options.tc === 1) {
            test.it('should be error while logging (incorrect email)', function() {
                driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"/account/login")]]')).click();

                let emailInput = driver.findElement(webdriver.By.name('email'));
                emailInput.sendKeys("adam@adam.pl");
                let passwordInput = driver.findElement(webdriver.By.name('password'));
                passwordInput.sendKeys("zaq12wsx");

                emailInput.submit();
                driver.findElement(webdriver.By.xpath('//div[contains(@class, "alert alert-danger")][contains(.,"Errors while logging") or contains(.,"Wystąpił błąd podczas logowania")]')).then(alert => {
                    if (!options.all) screenshot('1.1.png').desktop();
                    assert(true, true);
                });

            });
        }


        if (options.all || options.tc === 2) {
            test.it('should be error while logging (incorrect password)', function() {
                driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"/account/login")]]')).click();

                let emailInput = driver.findElement(webdriver.By.name('email'));
                emailInput.sendKeys("admin@example.com");
                let passwordInput = driver.findElement(webdriver.By.name('password'));
                passwordInput.sendKeys("zaq12wsx");
                emailInput.submit();

                driver.findElement(webdriver.By.xpath('//div[contains(@class, "alert alert-danger")][contains(.,"Errors while logging") or contains(.,"Wystąpił błąd podczas logowania")]')).then(() => {
                    if (!options.all) screenshot('1.2.png').desktop();
                    assert(true, true);
                });
            });
        }

        if (options.all || options.tc === 3) {
            test.it('should log in successfully', function() {
                driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"/account/login")]]')).click();

                let emailInput = driver.findElement(webdriver.By.name('email'));
                emailInput.sendKeys("admin@example.com");
                let passwordInput = driver.findElement(webdriver.By.name('password'));
                passwordInput.sendKeys("a123456");

                emailInput.submit();

                driver.getCurrentUrl().then(url => {
                    assert(url, "localhost:8000/user");
                });
                driver.findElements(webdriver.By.xpath('//a[@href[contains(.,"/user/account/logout")] and contains(.,"Wyloguj")]')).then(elems => {
                    if (!options.all) screenshot('1.3.png').desktop();
                    assert(Array.from(elems).length, 1);
                });
            });
        }
    });
}

if (options.all || options.sc === 2) {
    describe('Products list', function() {
        this.timeout(50000);

        test.beforeEach(() => {
            driver = new webdriver.Builder().withCapabilities(capabilities).build();
            driver.get('http://localhost:8000');
            logIn();
        });

        test.afterEach(function() {
            driver.quit();
        });


        if (options.all || options.tc === 4) {
            test.it('should be fully product list (20 items) on the firs page', function() {
                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[1]/div/a[@href[contains(.,"/admin")] and contains(.,"Admin Panel")]')).click();
                driver.findElement(webdriver.By.xpath('//*[@id="top-navigation"]/ul/li[4]/a[@href[contains(.,"/admin/products")] and contains(.,"Products")]')).click();

                driver.findElements(webdriver.By.xpath('//div[@class="col-lg-12"]/table/tbody/tr')).then(items => {
                    assert(items.length, 20);
                    if (!options.all) screenshot('2.4.png').desktop();
                });
            });
        }
        if (options.all || options.tc === 5) {
            test.it('each product should contain all information', function() {
                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[1]/div/a[@href[contains(.,"/admin")] and contains(.,"Admin Panel")]')).click();
                driver.findElement(webdriver.By.xpath('//*[@id="top-navigation"]/ul/li[4]/a[@href[contains(.,"/admin/products")] and contains(.,"Products")]')).click();

                if (!options.all) { screenshot('2.5.png').desktop(); }
                driver.findElements(webdriver.By.xpath('//div[@class="col-lg-12"]/table/tbody/tr/td')).then(elems => {
                    Array.from(elems).forEach(function(element) {
                        element.getAttribute('innerHTML').then(text => {
                            assert.notEqual(text, "");
                        });
                    });
                });
            });
        }
        if (options.all || options.tc === 6) {
            test.it('list of products should have 3 pages ', function() {
                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[1]/div/a[@href[contains(.,"/admin")] and contains(.,"Admin Panel")]')).click();
                driver.findElement(webdriver.By.xpath('//*[@id="top-navigation"]/ul/li[4]/a[@href[contains(.,"/admin/products")] and contains(.,"Products")]')).click();

                driver.findElements(webdriver.By.xpath('//ul[@class="pagination"]/li/span[text()="1"]')).then(elems => {
                    assert(Array.from(elems).length, 2);
                });
                driver.findElements(webdriver.By.xpath('//ul[@class="pagination"]/li/a[text()="2"]')).then(elems => {
                    assert(Array.from(elems).length, 2);
                });
                driver.findElements(webdriver.By.xpath('//ul[@class="pagination"]/li/a[text()="3"]')).then(elems => {
                    assert(Array.from(elems).length, 2);
                    if (!options.all) screenshot('2.6.png').desktop();
                });
            });
        }
    });
}

describe('Products', function() {
    this.timeout(200000);
    if (options.all || options.sc === 3) {

        if (options.all || options.tc === 9 || options.tc === 10 || options.tc === 11) {

            connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'toolsshop'
            });
            connection.connect();
        }

        test.after(() => {
            if (connection) {
                connection.end();
            }
        });

        test.beforeEach(() => {
            driver = new webdriver.Builder().withCapabilities(capabilities).build();
            driver.get('http://localhost:8000');
            logIn();
        });

        test.afterEach(function() {
            driver.quit();
        });

        if (options.all || options.tc === 7) {
            test.it('should be not add product without category', function() {

                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[3]/div/a[@href[contains(.,"user/products/new")]]')).click();

                let name = "Produkt testowy nr " + Math.random();
                let description = "Krótki opis testowanego produktu";
                let longDescription = "Długi opis testowanego produktu";
                let quantity = 1;
                let unitPrice = 99.99;
                let unityOfMeasure = "piece";

                let photo = process.cwd() + "/kot.jpg";

                driver.findElement(webdriver.By.id('name-en')).sendKeys(name);
                let desc = driver.findElement(webdriver.By.name('short_description[en]'));
                desc.sendKeys(description);
                driver.findElement(webdriver.By.name('long_description[en]')).sendKeys(longDescription);
                let input = driver.findElement(webdriver.By.name('quantity'));
                input.sendKeys(quantity);
                driver.findElement(webdriver.By.name('unit_price')).sendKeys(unitPrice);
                driver.findElement(webdriver.By.name('uom_id')).click('option:nth-child(3)');

                driver.findElement(webdriver.By.name('default_photo')).sendKeys(photo);

                //pl
                driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"#product-pl")]]')).click();
                driver.findElement(webdriver.By.id('name-pl')).sendKeys(name);
                driver.findElement(webdriver.By.name('short_description[pl]')).sendKeys(description);
                driver.findElement(webdriver.By.name('long_description[pl]')).sendKeys(longDescription);

                input.submit().then(() => {
                    assert(driver.findElements(webdriver.By.xpath('//div[@style[contains(.,"display: block;")]]/div/div/div/h4[contains(.,"Category error")]')).then(elems => Array.from(elems).length), 1);
                    if (!options.all) screenshot('3.7.png').desktop();
                });
            });
        }

        if (options.all || options.tc === 8) {
            test.it('should be not add product without name', function() {

                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[3]/div/a[@href[contains(.,"user/products/new")]]')).click();

                let name = "Produkt testowy nr " + Math.random();
                let description = "Krótki opis testowanego produktu";
                let longDescription = "Długi opis testowanego produktu";
                let quantity = 1;
                let unitPrice = 99.99;
                let unityOfMeasure = "piece";

                let photo = process.cwd() + "/kot.jpg";

                let desc = driver.findElement(webdriver.By.name('short_description[en]'));
                desc.sendKeys(description);
                driver.findElement(webdriver.By.name('long_description[en]')).sendKeys(longDescription);
                let quantityButton = driver.findElement(webdriver.By.name('quantity'));
                quantityButton.sendKeys(quantity);
                driver.findElement(webdriver.By.name('unit_price')).sendKeys(unitPrice);
                driver.findElement(webdriver.By.name('uom_id')).click('option:nth-child(3)');


                let category = driver.findElement(webdriver.By.xpath('//*[@id="tree"]/ul/li/span/span[@class="fancytree-title" and contains(.,"Hammers")]'));
                category.click().then(() => {
                    let select = driver.findElement(webdriver.By.id('category_id'));
                    driver.executeScript("arguments[0].value = arguments[1]", select, "12");
                    driver.findElement(webdriver.By.name('default_photo')).sendKeys(photo);

                    //pl
                    driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"#product-pl")]]')).click();
                    driver.findElement(webdriver.By.name('short_description[pl]')).sendKeys(description);
                    driver.findElement(webdriver.By.name('long_description[pl]')).sendKeys(longDescription);

                    quantityButton.submit().then(() =>
                        driver.findElement(webdriver.By.xpath('//div[contains(@class, "alert alert-danger")][contains(.,"Errors while adding product") or contains(.,"Wystąpiły błędy podczas dodawania produktu.")]')).then(alert => {
                            assert(true, true);
                            if (!options.all) screenshot('3.8.png').desktop();
                        })
                    )
                });
            });
        }

        if (options.all || options.tc === 9) {
            test.it('should be add product properly', function() {

                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[3]/div/a[@href[contains(.,"user/products/new")]]')).click();

                let name = "Produkt testowy nr " + Math.random();
                let description = "Krótki opis testowanego produktu";
                let longDescription = "Długi opis testowanego produktu";
                let quantity = 1;
                let unitPrice = 99.99;
                let unityOfMeasure = "piece";

                let photo = process.cwd() + "/kot.jpg";

                driver.findElement(webdriver.By.id('name-en')).sendKeys(name);
                let desc = driver.findElement(webdriver.By.name('short_description[en]'));
                desc.sendKeys(description);
                driver.findElement(webdriver.By.name('long_description[en]')).sendKeys(longDescription);
                driver.findElement(webdriver.By.name('quantity')).sendKeys(quantity);
                driver.findElement(webdriver.By.name('unit_price')).sendKeys(unitPrice);
                driver.findElement(webdriver.By.name('uom_id')).click('option:nth-child(3)');

                let select = driver.findElement(webdriver.By.xpath('//*[@id="tree"]/ul/li/span/span[@class="fancytree-title" and contains(.,"Hammers")]'));
                select.click().then(() => {
                    let select = driver.findElement(webdriver.By.id('category_id'));
                    driver.executeScript("arguments[0].value = arguments[1]", select, "12");

                    driver.findElement(webdriver.By.name('default_photo')).sendKeys(photo);

                    //pl
                    driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"#product-pl")]]')).click();
                    let input = driver.findElement(webdriver.By.id('name-pl'));
                    input.sendKeys(name);
                    driver.findElement(webdriver.By.name('short_description[pl]')).sendKeys(description);
                    driver.findElement(webdriver.By.name('long_description[pl]')).sendKeys(longDescription);

                    input.submit().then(() => {
                        driver.findElement(webdriver.By.xpath('//div[contains(@class, "alert alert-success")][contains(.,"Product was added successfully.") or contains(.,"Produkt został dodany pomyślnie")]')).then(alert => {
                            assert(true, true);
                        })
                    });

                    driver.findElements(webdriver.By.xpath('//ul[@class="pagination"]/li/a')).then(elems => {
                        elems[Array.from(elems).length - 2].click().then(() => {
                            assert(driver.findElements(webdriver.By.xpath('//h4[contains(.,"' + name + '")]')).then(elems => Array.from(elems).length), 1);
                            if (!options.all) screenshot('3.9.png').desktop();
                        });
                    });

                    connection.query('delete from products order by product_id desc limit 1 ', function(error, results, fields) {
                        if (error) console.log(error);
                    });

                });
            });
        }

        if (options.all || options.tc === 10) {
            test.it('should be add product properly and exising in category page', function() {

                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[3]/div/a[@href[contains(.,"user/products/new")]]')).click();

                let name = "Produkt testowy nr " + Math.random();
                let description = "Krótki opis testowanego produktu";
                let longDescription = "Długi opis testowanego produktu";
                let quantity = 1;
                let unitPrice = 99.99;
                let unityOfMeasure = "piece";

                let photo = process.cwd() + "/kot.jpg";

                driver.findElement(webdriver.By.id('name-en')).sendKeys(name);
                let desc = driver.findElement(webdriver.By.name('short_description[en]'));
                desc.sendKeys(description);
                driver.findElement(webdriver.By.name('long_description[en]')).sendKeys(longDescription);
                driver.findElement(webdriver.By.name('quantity')).sendKeys(quantity);
                driver.findElement(webdriver.By.name('unit_price')).sendKeys(unitPrice);
                driver.findElement(webdriver.By.name('uom_id')).click('option:nth-child(3)');

                let inputCategory = driver.findElement(webdriver.By.xpath('//*[@id="tree"]/ul/li/span/span[@class="fancytree-title" and contains(.,"Hammers")]'));
                inputCategory.click().then(() => {
                    let select = driver.findElement(webdriver.By.id('category_id'));
                    driver.executeScript("arguments[0].value = arguments[1]", select, "12");
                    driver.findElement(webdriver.By.name('default_photo')).sendKeys(photo);

                    //pl
                    driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"#product-pl")]]')).click();
                    let input = driver.findElement(webdriver.By.id('name-pl'))
                    input.sendKeys(name);
                    driver.findElement(webdriver.By.name('short_description[pl]')).sendKeys(description);
                    driver.findElement(webdriver.By.name('long_description[pl]')).sendKeys(longDescription);

                    input.submit().then(() => {

                        driver.findElement(webdriver.By.xpath('//div[contains(@class, "alert alert-success")][contains(.,"Product was added successfully.") or contains(.,"Produkt został dodany pomyślnie")]')).then(alert => {
                            assert(true, true);
                        })
                    });

                    driver.findElement(webdriver.By.xpath(' //a[@href[contains(.,"category/12")] and (contains(.,"Młotki") or contains(.,"Hammers"))]')).click().then(() => {

                        // driver.findElements(webdriver.By.xpath('//ul[@class="pagination"]/li/a')).then(elems => {
                        //     elems[Array.from(elems).length - 2].click().then(() => {
                        if (!options.all) screenshot('3.10.png').desktop();
                        assert(driver.findElements(webdriver.By.xpath('//h4[contains(.,' + name + ')]')).then(elems => Array.from(elems).length), 1);
                        // })
                        // })
                    });
                    connection.query('delete from products order by product_id desc limit 1 ', function(error, results, fields) {
                        if (error) console.log(error);
                    });


                });
            });
        }

        if (options.all || options.tc === 11) {
            test.it('should be error because of js code in input', function() {

                driver.findElement(webdriver.By.xpath('//*[@id="userpanel-navigation"]/div[3]/div/a[@href[contains(.,"user/products/new")]]')).click();

                let name = "Produkt testowy nr " + Math.random();
                let description = "Krótki opis testowanego produktu";
                let longDescription = "<script>alert('XSS')</script>";
                let quantity = 1;
                let unitPrice = 99.99;
                let unityOfMeasure = "piece";

                let photo = process.cwd() + "/kot.jpg";

                driver.findElement(webdriver.By.id('name-en')).sendKeys(name);
                let desc = driver.findElement(webdriver.By.name('short_description[en]'));
                desc.sendKeys(description);
                driver.findElement(webdriver.By.name('long_description[en]')).sendKeys(longDescription);
                driver.findElement(webdriver.By.name('quantity')).sendKeys(quantity);
                driver.findElement(webdriver.By.name('unit_price')).sendKeys(unitPrice);
                driver.findElement(webdriver.By.name('uom_id')).click('option:nth-child(3)');

                let inputCategory = driver.findElement(webdriver.By.xpath('//*[@id="tree"]/ul/li/span/span[@class="fancytree-title" and contains(.,"Hammers")]'));
                inputCategory.click().then(() => {
                    let select = driver.findElement(webdriver.By.id('category_id'));
                    driver.executeScript("arguments[0].value = arguments[1]", select, "12");

                    driver.findElement(webdriver.By.name('default_photo')).sendKeys(photo);

                    //pl
                    driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"#product-pl")]]')).click();
                    let input = driver.findElement(webdriver.By.id('name-pl'));
                    input.sendKeys(name);
                    driver.findElement(webdriver.By.name('short_description[pl]')).sendKeys(description);
                    driver.findElement(webdriver.By.name('long_description[pl]')).sendKeys(longDescription);

                    input.submit().then(() => {
                        if (!options.all) screenshot('3.11.png').desktop();
                        driver.findElement(webdriver.By.xpath('//div[contains(@class, "alert alert-danger")][contains(.,"Errors while adding product") or contains(.,"Wystąpiły błędy podczas dodawania produktu.")]')).then(alert => {
                            assert(true, true);
                        })
                    });
                    connection.query('delete from products order by product_id desc limit 1 ', function(error, results, fields) {
                        if (error) console.log(error);
                    });
                });

            });
        }

        if (options.all || options.tc === 12) {
            test.it('should be sort products properly', function() {

                let sortedArray = [];

                driver.findElement(webdriver.By.xpath('//ul[@id="menu-categories"]/li/a[text()="Młotki" or text()="Hammers"]')).click();
                driver.findElement(webdriver.By.xpath('//div[@class[contains(.,"col-xs-12")]]/div/button[@class[contains(.,"dropdown-toggle")]]')).click().then(() => {


                    driver.findElement(webdriver.By.xpath('//div[@class[contains(.,"col-xs-12")]]/div/ul/li/a[contains(.,"By name A-Z")]')).click().then(() => {

                        driver.findElements(webdriver.By.xpath('//div[@class="col-sm-9"]')).then(elems => {
                            Array.from(elems).forEach(function(element) {
                                element.getAttribute('innerHTML').then(text => {
                                    sortedArray.push(text);
                                }).then(() => {
                                    for (var i = 0; i < sortedArray.length - 1; i++) {
                                        assert(sortedArray[i] < sortedArray[i + 1], true);
                                    }
                                    if (!options.all) screenshot('3.12.png').desktop();
                                });
                            }, this);
                        });
                    })
                })
            });
        }

    }
});

function logIn() {
    driver.findElement(webdriver.By.xpath('//a[@href[contains(.,"/account/login")]]')).click();

    let emailInput = driver.findElement(webdriver.By.name('email'));
    emailInput.sendKeys("admin@example.com");
    let passwordInput = driver.findElement(webdriver.By.name('password'));


    passwordInput.sendKeys("a123456");

    emailInput.submit();
}