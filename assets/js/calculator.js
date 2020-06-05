jQuery(document).ready(function ($) {

        var calculatorTag = $('.j-calculator'),
            sHtml = '',
            sCurrentHoster = 'servnet',
            bInitDefCor,
            fnSetDefault,
            fnInitDefaultHoster,
            oHosters = [],
            pricing = '',
            currency = '',
            calculatorsWithSelector = [],
            sCssLoading = 'loading';

        $(calculatorTag).addClass(sCssLoading);


        function renderHosterSelector(el) {

            oHosters.sort(function (a, b) {
                var nameA = a.keyword.toLowerCase(),
                    nameB = b.keyword.toLowerCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0;
            });

            sHtml = new EJS({url: '/j-calculator/templates/j-hoster-selector'}).render({
                txChoose: 'Choose Service Provider of Jelastic Public Cloud',
                txPerfomance: 'Perfomance',
                txSupport: 'Support',
                txLocation: 'Location',
                txServices: 'Advanced Services',
                defHoster: sCurrentHoster,
                hosters: oHosters
            });

            for (var i = 0, oHoster; oHoster = oHosters[i]; i++) {
                if (sCurrentHoster === oHoster.keyword) {
                    $(el).attr('data-key', oHoster.key);
                    $(el).attr('data-hoster', oHoster.keyword);
                    $(el).attr('data-custom-signup', oHoster.customSignUp);
                }
            }

            if ($(el).find('.hoster-selector').length > 0) {
                $(el).find('.hoster-selector').replaceWith(sHtml);
            } else {
                $(el).append(sHtml);
            }

            $(el).find('.hoster-selector--select').each(function () {
                var $this = $(this), numberOfOptions = $(this).children('option').length;

                $this.addClass('select-hidden');
                $this.wrap('<div class="select"></div>');
                $this.after('<div class="select-styled"></div>');

                var $styledSelect = $this.next('div.select-styled');
                $styledSelect.text($this.children('option:selected').text());

                var $list = $('<ul />', {
                    'class': 'select-options'
                }).insertAfter($styledSelect);


                for (var i = 0; i < numberOfOptions; i++) {

                    var classes = '';
                    if ($this.children('option').eq(i).text() === $this.children('option:selected').text()) {
                        classes = 'current-hoster';
                    }
                    var li = $('<li />', {
                        text: $this.children('option').eq(i).text(),
                        rel: $this.children('option').eq(i).val(),
                        class: classes
                    }).appendTo($list);

                    var li_flags = $('<span />', {
                        class: 'flags',
                    }).appendTo(li);

                    var loc = $this.children('option').eq(i).attr('data-location').split(',').filter(onlyUnique);
                    $.each(loc, function (index, code) {
                        $('<i />', {
                            class: 'flag flag-' + code,
                            text: code
                        }).appendTo(li_flags);
                    })

                }

                var $listItems = $list.children('li');

                $styledSelect.click(function (e) {
                    e.stopPropagation();
                    $('div.select-styled.active').not(this).each(function () {
                        $(this).removeClass('active').next('ul.select-options').hide();
                    });
                    $(this).toggleClass('active').next('ul.select-options').toggle();
                });

                $listItems.click(function (e) {
                    e.stopPropagation();
                    $styledSelect.text($(this).text()).removeClass('active');
                    $this.val($(this).attr('rel')).change();
                    $list.hide();
                });

                $(document).click(function () {
                    $styledSelect.removeClass('active');
                    $list.hide();
                });

            });

        }

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        function renderCalculator(el) {

            var oLanguages = $(el).data('languages') || ['java', 'php', 'node', 'python', 'go', 'ruby'],
                fixed = '',
                dynamic = '',
                ip = '',
                network = '',
                storage = '',
                period = $(el).attr('data-period') || 'hourly',
                startCurrency = $(el).attr('data-start-currency') || 'USD';

            if (!Array.isArray(oLanguages)) {
                oLanguages = oLanguages.split(",").map(function (item) {
                    return item.trim();
                });
            }


            window.currency.sort(function (a, b) {
                var nameA = a.code.toLowerCase(),
                    nameB = b.code.toLowerCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0;
            });

            $.each(window.currency, function (index) {
                if (this.code === 'USD' || this.code === 'EUR') {
                    window.currency.splice(0, 0, window.currency.splice(index, 1)[0]);
                }
            });

            sHtml = new EJS({url: '/j-calculator/templates/j-calculator'}).render({
                oLanguages: oLanguages,
                id: Math.round(Math.random() * 100000000),
                currencies: window.currency,
                startCurrency: startCurrency,

                balancerNodes: parseInt($(el).attr('data-balancer-nodes')) || 1,
                balancerMin: parseInt($(el).attr('data-balancer-min')) || 0,
                balancerMax: parseInt($(el).attr('data-balancer-max')) || 128,

                balancerReserved: parseInt($(el).attr('data-balancer-reserved')) || 0,
                balancerScaling: parseInt($(el).attr('data-balancer-scaling')) || 0,

                appServerNodes: parseInt($(el).attr('data-appserver-nodes')) || 1,
                appServerMin: parseInt($(el).attr('data-appserver-min')) || 0,
                appServerMax: parseInt($(el).attr('data-appserver-max')) || 128,

                appServerReserved: parseInt($(el).attr('data-appserver-reserved')) || 1,
                appServerScaling: parseInt($(el).attr('data-appserver-scaling')) || 64,

                databaseNodes: parseInt($(el).attr('data-database-nodes')) || 1,
                databaseMin: parseInt($(el).attr('data-database-min')) || 0,
                databaseMax: parseInt($(el).attr('data-database-max')) || 128,

                databaseReserved: parseInt($(el).attr('data-database-reserved')) || 0,
                databaseScaling: parseInt($(el).attr('data-database-scaling')) || 0,
            });

            if ($(el).find('.calculator-wrapper').length > 0) {
                $(el).find('.calculator-wrapper').replaceWith(sHtml);
            } else {
                $(el).append(sHtml);
            }

            $(el).attr('data-mode', 'appserver');

            $(el).attr('data-period', period);
            $(el).find('input[value=' + period + ']').attr('checked', 'checked').change();


            var sKey = window.pricing[$(el).attr('data-key')],
                tariffPlans = sKey.tariffPlans;

            for (var i = 0, oHoster; oHoster = oHosters[i]; i++) {
                if ($(el).attr('data-key') === oHoster.key) {
                    $(el).attr('data-currency', oHoster.currencyCode);
                }
            }

            if (tariffPlans.length > 0) {
                $.each(tariffPlans, function () {

                    if (this.type.toLowerCase() === 'fixed') {
                        fixed = this;
                    }
                    if (this.type.toLowerCase() === 'flexible') {
                        dynamic = this;
                    }
                    if (this.type.toLowerCase() === 'network') {
                        network = this;
                    }
                    if (this.type.toLowerCase() === 'storage') {
                        storage = this;
                    }
                    if (this.keyword.toLowerCase() === 'ip') {
                        ip = this;
                    }
                });
            }


            $(el).find('.current-switcher').each(function () {

                var $this = $(this), numberOfOptions = $(this).children('option').length;

                $this.addClass('select-hidden');
                $this.wrap('<div class="select"></div>');
                $this.after('<div class="select-styled"></div>');

                var $styledSelect = $this.next('div.select-styled');
                $styledSelect.html($this.children('option:selected').attr('data-sign') + ' - ' + $this.children('option:selected').html());

                var $list = $('<ul />', {
                    'class': 'select-options'
                }).insertAfter($styledSelect);

                for (var i = 0; i < numberOfOptions; i++) {

                    var classes = '';
                    if ($this.children('option').eq(i).text() === $this.children('option:selected').text()) {
                        classes = 'current-currency';
                    }

                    var li = $('<li />', {
                        text: $this.children('option').eq(i).html(),
                        rel: $this.children('option').eq(i).val(),
                        class: classes
                    }).appendTo($list);

                    $('<span />', {
                        class: 'currency-sign',
                        text: $this.children('option').eq(i).attr('data-sign') + ' - '
                    }).prependTo(li);

                    $('<span />', {
                        class: 'currency-name',
                        text: $this.children('option').eq(i).attr('data-name')
                    }).appendTo(li);

                }

                var $listItems = $list.children('li');

                $styledSelect.click(function (e) {
                    e.stopPropagation();
                    $('div.select-styled.active').not(this).each(function () {
                        $(this).removeClass('active').next('ul.select-options').hide();
                    });
                    $(this).toggleClass('active').next('ul.select-options').toggle();
                });

                $listItems.click(function (e) {
                    $list.find('.current-currency').removeClass('current-currency');
                    $(this).addClass('current-currency');
                    e.stopPropagation();
                    $styledSelect.html($(this).html()).removeClass('active');
                    $this.val($(this).attr('rel')).change();
                    $list.hide();
                });

                $(document).click(function () {
                    $styledSelect.removeClass('active');
                    $list.hide();
                });

            });

            $add.Slider = function (el, settings) {
                var $el = $(el);
                var s = {};
                if ($el.attr("name"))
                    s.name = $el.attr("name");
                if ($el.attr("class"))
                    s.class = $el.attr("class");
                if ($el.attr("id"))
                    s.id = $el.attr("id");
                if ($el.attr("value"))
                    s.value = $el.attr("value");
                if ($el.attr("min"))
                    s.min = $el.attr("min");
                if ($el.attr("max"))
                    s.max = $el.attr("max");
                if ($el.attr("step"))
                    s.step = $el.attr("step");

                s.storage = storage;
                s.ip = ip;

                s.fixed = fixed;
                s.dynamic = dynamic;
                s.network = network;

                settings = $.extend(s, $el.data(), settings);


                var S = new $add.SliderObj(settings);
                S.render($el, "replace");
                return S;
            };

            var appserverslider = $add.Slider($(el).find('.appserver-range input'), ''),
                balancerslider = $add.Slider($(el).find('.balancer-range input'), ''),
                databaseslider = $add.Slider($(el).find('.database-range input'), '');

            var sliders = {
                'appserver': appserverslider,
                'balancer': balancerslider,
                'database': databaseslider,
            };


            var defaultOptions = {
                "storage": 10,
                "ip": 1,
                "traffic": 10,
                "balancer-nodes": 0,
                "appserver-nodes": 1,
                "database-nodes": 0
            };
            $.each(defaultOptions, function (key, value) {
                var digit = el[0].querySelectorAll('[name=' + key + ']')[0];
                if (el[0].getAttribute('data-' + key)) {
                    digit.value = el[0].getAttribute('data-' + key);
                    if (+el[0].getAttribute('data-' + key) > +digit.getAttribute('max')) {
                        el[0].setAttribute('data-' + key, digit.getAttribute('max'));
                        digit.value = el[0].getAttribute('data-' + key);
                    }
                } else {
                    el[0].setAttribute('data-' + key, value);
                    digit.value = el[0].getAttribute('data-' + key);
                }
            });


            $(el).find('input[name*="mode"]').click(function (e) {
                changeMode($(this).val(), el);
                setMinValues(el, $(el).attr('data-mode'));
                setMaxValues(el, $(el).attr('data-mode'));
            });
            $(el).find('input[name*="mode"][value=appserver]').click();
            $(el).find('.min-block-decrease').click(function (e) {
                e.preventDefault();
                var slider = sliders[$(el).attr('data-mode')];
                decreaseReserved(slider);
            });
            $(el).find('.min-block-increase').click(function (e) {
                e.preventDefault();
                var slider = sliders[$(el).attr('data-mode')];
                increaseReserved(slider);
            });
            $(el).find('.max-block-decrease').click(function (e) {
                e.preventDefault();
                var slider = sliders[$(el).attr('data-mode')];
                decreaseScaling(slider);
            });
            $(el).find('.max-block-increase').click(function (e) {
                e.preventDefault();
                var slider = sliders[$(el).attr('data-mode')];
                increaseScaling(slider);
            });
            $(el).find('.digit, .node-count input').change(function (e) {
                var digit = $(this),
                    type = digit.attr('name');

                el[0].setAttribute('data-' + type, this.value);

                if (parseInt(digit.val()) > parseInt(digit.attr('max'))) {
                    digit.val(digit.attr('max')).change();
                }

                if (parseInt(digit.val()) < 0 || digit.val() === '') {
                    digit.val(0).change();
                }

                setPrice(fixed.tiers, dynamic.tiers, el, storage.tiers, ip.tiers, network.tiers);
            });
            $(el).find('.plus').click(function (e) {
                e.preventDefault();
                increaseBlockDigit(this);
            });
            $(el).find('.minus').click(function (e) {
                e.preventDefault();
                decreaseBlockDigit(this);
            });
            $(el).find('.plus-node').click(function (e) {
                e.preventDefault();
                increseNode(this);
            });
            $(el).find('.minus-node').click(function (e) {
                e.preventDefault();
                decreaseNode(this);
            });
            $(el).find('.calculator-right input').click(function (e) {
                $(el).attr('data-period', $(this).val());
                setPrice(fixed.tiers, dynamic.tiers, el, storage.tiers, ip.tiers, network.tiers);
            });
            $(el).find('.current-switcher').change(function (e) {
                setPrice(fixed.tiers, dynamic.tiers, el, storage.tiers, ip.tiers, network.tiers);
            });

            $(calculatorTag).removeClass(sCssLoading);

        }

        function increseNode(clickedElement) {
            var digit = $(clickedElement).closest('.node-count').find('input');
            digit.val(parseInt(digit.val()) + 1).change();
        }

        function decreaseNode(clickedElement) {
            var digit = $(clickedElement).closest('.node-count').find('input');
            if (parseInt(digit.val()) > 0) {
                digit.val(parseInt(digit.val()) - 1).change();
            }
        }


        function decreaseReserved(oSlider) {
            var l = oSlider.value.split(',')[0];
            var r = oSlider.value.split(',')[1];
            if (l > oSlider._settings.min) {
                l--;
                oSlider.value = '' + l + ',' + r + '';
            }
        }

        function increaseReserved(oSlider) {
            var l = oSlider.value.split(',')[0];
            var r = oSlider.value.split(',')[1];
            if (l < oSlider._settings.max) {
                if (l === r) {
                    r++;
                }
                l++;
                oSlider.value = '' + l + ',' + r + '';
            }
        }

        function decreaseScaling(oSlider) {
            var l = oSlider.value.split(',')[0];
            var r = oSlider.value.split(',')[1];
            if (r > oSlider._settings.min) {
                if (l === r) {
                    l--;
                }
                r--;

                oSlider.value = '' + l + ',' + r + '';
            }
        }

        function increaseScaling(oSlider) {
            var l = oSlider.value.split(',')[0];
            var r = oSlider.value.split(',')[1];
            if (r < oSlider._settings.max) {
                r++;
                oSlider.value = '' + l + ',' + r + '';
            }
        }

        function increaseBlockDigit(clickedElement) {
            var digit = $(clickedElement).closest('.inner').find('.digit');
            digit.val(parseInt(digit.val()) + 1).change();
        }

        function decreaseBlockDigit(clickedElement) {
            var digit = $(clickedElement).closest('.inner').find('.digit');
            if (parseInt(digit.val()) > 0) {
                digit.val(parseInt(digit.val()) - 1).change();
            }
        }

        function importPricing() {
            $.ajax({
                type: "GET",
                url: '//platforms-info.jelastic.com/api/GetPricings',
                dataType: "json",
                success: function (pricingJSON) {
                    if (pricingJSON.result === 0) {
                        window.pricing = pricingJSON.response.pricings;
                        $.ajax({
                            type: "GET",
                            url: '//platforms-info.jelastic.com/api/GetCurrency',
                            dataType: "json",
                            success: function (currencyJSON) {
                                if (currencyJSON.result === 0) {
                                    window.currency = currencyJSON.response.objects;


                                    JApp.loadHosters(function (hosters) {

                                        $.each(hosters, function (index) {
                                            if (this.keyword === 'servint') {
                                                hosters.splice(index, 1);
                                                return false;
                                            }
                                        });
                                        oHosters = hosters;
                                        if (calculatorTag.length > 0) {
                                            $.each(calculatorTag, function (e) {
                                                $(this).attr('data-key') ? renderCalculator($(this)) : calculatorsWithSelector.push(this);
                                            });
                                        }

                                        fnSetDefault();

                                    });

                                }
                            },
                            error: function (response) {
                                console.log(response);
                            }
                        });
                    }
                },
                error: function (response) {
                    console.log(response);
                }
            });
        }

        importPricing();

        $(window).resize(function () {
            $('.j-calculator[data-mode]').each(function () {
                setMinValues(this, $(this).attr('data-mode'));
                setMaxValues(this, $(this).attr('data-mode'));
            });
        });

        function uniqid(a = "", b = false) {
            var c = Date.now() / 1000;
            var d = c.toString(16).split(".").join("");
            while (d.length < 14) {
                d += "0";
            }
            var e = "";
            if (b) {
                e = ".";
                var f = Math.round(Math.random() * 100000000);
                e += f;
            }
            return a + d + e;
        }

        function changeMode(value, el) {
            $(el).attr('data-mode', value);
        }

        function setReservedCloudlets(cloudlets, el, type) {
            $(el).attr('data-' + type + '-reserved', cloudlets);
            setMinValues(el, type);
        }

        function setScalingCloudlets(cloudlets, el, type) {
            if (cloudlets === 0) {
                $(el).find('label[for*=' + type + ']').removeClass('active');
                $(el).find('label[for*=' + type + '] .node-count input').val(0).change();
            } else {
                if (!$(el).find('label[for*=' + type + ']').hasClass('active')) {
                    $(el).find('label[for*=' + type + '] .node-count input').val(1).change();
                }
                $(el).find('label[for*=' + type + ']').addClass('active');
            }

            $(el).attr('data-' + type + '-scaling', cloudlets);
            setMaxValues(el, type);
        }

        function getReservedCloudlets(el, type) {
            return parseInt($(el).attr('data-' + type + '-reserved'));
        }

        function getScalingCloudlets(el, type) {
            return parseInt($(el).attr('data-' + type + '-scaling'));
        }

        function convertMib(value) {
            value *= 128;
            return value > 1000 ? parseFloat(value / 1024).toFixed(2) + " GiB" : value + " MiB";
        }

        function convertMhz(value) {
            value *= 400;
            return value > 1000 ? parseFloat(value / 1000).toFixed(2) + " GHz" : value + " MHz";
        }

        function changePricePeriod(sValue, sPeriod) {
            switch (sPeriod) {
                case 'hourly':
                    sValue = Math.round(sValue * 100000) / 100000;
                    break;

                case 'monthly':
                    sValue = (sValue * 730).toFixed(2);
                    break
            }

            return sValue;
        }

        function checkStoragePrice(sValue, tiers) {
            sValue = parseInt(sValue);
            var price = tiers[0].price;

            if (sValue < tiers[0].value) {
                return 0;
            }

            for (var i = 0; i < tiers.length; i++) {
                if (!tiers[i + 1]) {
                    if ((tiers[tiers.length - 1].free > 0) && (sValue <= tiers[tiers.length - 1].free)) {
                        return 0;
                    } else {
                        return (sValue - tiers[tiers.length - 1].free) * tiers[tiers.length - 1].price;
                    }
                } else {
                    if ((sValue >= tiers[i].value) && (sValue < tiers[i + 1].value)) {
                        if ((tiers[i].free > 0) && (sValue <= tiers[i].free)) {
                            return 0;
                        } else {
                            price = tiers[i].price;
                            return (sValue - tiers[i].free) * price;
                        }
                    }
                }
            }

        }

        function checkIpPrice(sValue, tiers) {
            sValue = parseInt(sValue);
            var price = tiers[0].price;

            if (sValue < tiers[0].value) {
                return 0;
            }

            for (var i = 0; i < tiers.length; i++) {
                if (!tiers[i + 1]) {
                    if ((tiers[tiers.length - 1].free > 0) && (sValue <= tiers[tiers.length - 1].free)) {
                        return 0;
                    } else {
                        price = tiers[tiers.length - 1].price;
                    }
                } else {
                    if ((sValue >= tiers[i].value) && (sValue < tiers[i + 1].value)) {
                        if ((tiers[i].free > 0) && (sValue <= tiers[i].free)) {
                            return 0;
                        } else {
                            price = tiers[i].price;
                            return sValue * price;
                        }
                    }
                }
            }
            return sValue * price;
        }

        function checkTrafficPrice(sValue, tiers) {

            sValue = parseInt(sValue);
            var different = 0;

            if (sValue < tiers[0].value) {
                return 0;
            }

            for (var i = 0; i < tiers.length; i++) {
                different = sValue - tiers[i].value;

                if (!tiers[i + 1]) {
                    if (tiers[tiers.length - 1].free > 0) {

                        var val = sValue - tiers[tiers.length - 1].free;
                        if (val < 0) {
                            val = 0;
                        }
                        return val * tiers[tiers.length - 1].price;

                    } else {
                        return tiers[tiers.length - 1].price * sValue;
                    }
                } else {
                    if ((sValue >= tiers[i].value) && (sValue < tiers[i + 1].value)) {
                        if (tiers[i].free > 0) {

                            var val = sValue - tiers[i].free;

                            if (val < 0) {
                                val = 0;
                            }

                            return val * tiers[i].price;

                        } else {
                            return sValue * tiers[i].price;
                        }
                    }
                }
            }
        }

        function setPrice(reservedTiers, scalingTiers, el, storageTiers, ipTiers, trafficTiers) {

            var currentCurrency = '',
                originalCurrency = '',
                currency = $(el).find('.current-switcher').val();

            $.each(window.currency, function (index) {
                if (currency === this.code) {
                    currentCurrency = this;
                }
                if ($(el).attr('data-currency') === this.code) {
                    originalCurrency = this;
                }
            });


            var balancerNodes = $(el).attr('data-balancer-nodes'),
                appServerNodes = $(el).attr('data-appserver-nodes'),
                databaseNodes = $(el).attr('data-database-nodes'),
                minBalancerPrice = checkPrice(parseInt(getReservedCloudlets(el, 'balancer')) * parseInt(balancerNodes), reservedTiers),
                minAppserverPrice = checkPrice(parseInt(getReservedCloudlets(el, 'appserver')) * parseInt(appServerNodes), reservedTiers),
                minDatabasePrice = checkPrice(parseInt(getReservedCloudlets(el, 'database')) * parseInt(databaseNodes), reservedTiers),
                maxBalancerPrice = checkMaxPrice(parseInt(getScalingCloudlets(el, 'balancer')) * parseInt(balancerNodes), scalingTiers, parseInt(getReservedCloudlets(el, 'balancer')) * parseInt(balancerNodes), reservedTiers),
                maxAppserverPrice = checkMaxPrice(parseInt(getScalingCloudlets(el, 'appserver')) * parseInt(appServerNodes), scalingTiers, parseInt(getReservedCloudlets(el, 'appserver')) * parseInt(appServerNodes), reservedTiers),
                maxDatabasePrice = checkMaxPrice(parseInt(getScalingCloudlets(el, 'database')) * parseInt(databaseNodes), scalingTiers, parseInt(getReservedCloudlets(el, 'database')) * parseInt(databaseNodes), reservedTiers),
                storagePrice = checkStoragePrice($(el).attr('data-storage'), storageTiers),
                ipPrice = checkIpPrice($(el).attr('data-ip'), ipTiers),
                trafficPrice = checkTrafficPrice($(el).attr('data-traffic'), trafficTiers);

            // TRAFFIC
            trafficPrice = toCurrency(trafficPrice, originalCurrency.rate.USD, currentCurrency.rate.USD);
            if ($(el).attr('data-period') === 'hourly') {
                trafficPrice = trafficPrice / 730;
            }

            // MIN PRICE
            var minPrice = minBalancerPrice + minAppserverPrice + minDatabasePrice;
            minPrice = minPrice + storagePrice + ipPrice;
            minPrice = toCurrency(minPrice, originalCurrency.rate.USD, currentCurrency.rate.USD);
            minPrice = changePricePeriod(minPrice, $(el).attr('data-period'));
            minPrice = +minPrice + +trafficPrice;
            switch ($(el).attr('data-period')) {
                case 'hourly':
                    minPrice = Math.round(minPrice * 1000) / 1000;
                    break;
                case 'monthly':
                    minPrice = (minPrice).toFixed(2);
                    break
            }
            $(el).find('.start-price .price').html(minPrice);


            // MAX PRICE
            var maxPrice = maxBalancerPrice + maxAppserverPrice + maxDatabasePrice;
            maxPrice = maxPrice + storagePrice + ipPrice;
            maxPrice = toCurrency(maxPrice, originalCurrency.rate.USD, currentCurrency.rate.USD);
            maxPrice = changePricePeriod(maxPrice, $(el).attr('data-period'));
            maxPrice = +maxPrice + +trafficPrice;
            if (+maxPrice < +minPrice) {
                maxPrice = minPrice;
            }
            switch ($(el).attr('data-period')) {
                case 'hourly':
                    maxPrice = Math.round(maxPrice * 1000) / 1000;
                    break;
                case 'monthly':
                    maxPrice = parseFloat(maxPrice).toFixed(2);
                    break
            }
            $(el).find('.max-price .price').html(maxPrice);


            // RESERVED COUNTS
            var reservedBalancerCloudlets = parseInt(getReservedCloudlets(el, 'balancer')) * parseInt(balancerNodes),
                reservedAppServerCloudlets = parseInt(getReservedCloudlets(el, 'appserver')) * parseInt(appServerNodes),
                reservedDbCloudlets = parseInt(getReservedCloudlets(el, 'database')) * parseInt(databaseNodes),
                reservedCloudletsMib = convertMib(+reservedBalancerCloudlets + +reservedAppServerCloudlets + +reservedDbCloudlets),
                reservedCloudletsGHz = convertMhz(+reservedBalancerCloudlets + +reservedAppServerCloudlets + +reservedDbCloudlets);

            $(el).find('.reserved-totals .gibs').html(reservedCloudletsMib);
            $(el).find('.reserved-totals .ghz').html(reservedCloudletsGHz);
            $(el).find('.reserved-totals .balancer').html(reservedBalancerCloudlets);
            $(el).find('.reserved-totals .appserver').html(reservedAppServerCloudlets);
            $(el).find('.reserved-totals .database').html(reservedDbCloudlets);
            $(el).find('.reserved-totals .cloudlets-total').html(+reservedBalancerCloudlets + +reservedAppServerCloudlets + +reservedDbCloudlets);

            var charsLength = reservedBalancerCloudlets + '' + reservedAppServerCloudlets + '' + reservedDbCloudlets;
            if (charsLength.length >= 8) {
                $(el).find('.calculator-right').addClass('new-row');
            } else {
                $(el).find('.calculator-right').removeClass('new-row');
            }

            // SCALING COUNTS
            var scalingBalancerCloudlets = parseInt(getScalingCloudlets(el, 'balancer')) * parseInt(balancerNodes),
                scalingAppServerCloudlets = parseInt(getScalingCloudlets(el, 'appserver')) * parseInt(appServerNodes),
                scalingDbCloudlets = parseInt(getScalingCloudlets(el, 'database')) * parseInt(databaseNodes),
                scalingCloudletsMib = convertMib(+scalingBalancerCloudlets + +scalingAppServerCloudlets + +scalingDbCloudlets),
                scalingCloudletsGHz = convertMhz(+scalingBalancerCloudlets + +scalingAppServerCloudlets + +scalingDbCloudlets);

            $(el).find('.scaling-totals .gibs').html(scalingCloudletsMib);
            $(el).find('.scaling-totals .ghz').html(scalingCloudletsGHz);
            $(el).find('.scaling-totals .balancer').html(scalingBalancerCloudlets);
            $(el).find('.scaling-totals .appserver').html(scalingAppServerCloudlets);
            $(el).find('.scaling-totals .database').html(scalingDbCloudlets);
            $(el).find('.scaling-totals .cloudlets-total').html(+scalingBalancerCloudlets + +scalingAppServerCloudlets + +scalingDbCloudlets);

            charsLength = scalingBalancerCloudlets + '' + scalingAppServerCloudlets + '' + scalingDbCloudlets;
            if (!$(el).find('.calculator-right').hasClass('new-row')) {
                if (charsLength.length >= 8) {
                    $(el).find('.calculator-right').addClass('new-row');
                } else {
                    $(el).find('.calculator-right').removeClass('new-row');
                }
            }


        }

        function checkPrice(cloudlets, tiers) {

            if (cloudlets < 1) {
                return 0;
            }

            for (var i = 0; i < tiers.length; i++) {
                var freeCloudlets = 0;
                if (i !== tiers.length - 1) {
                    if ((cloudlets >= tiers[i].value) && (cloudlets < tiers[i + 1].value)) {
                        freeCloudlets = cloudlets - tiers[i].value;
                        if (freeCloudlets <= tiers[i].free) {
                            return tiers[i].price * tiers[i].value;
                        } else {
                            return cloudlets * tiers[i].price;
                        }
                    }
                } else {
                    freeCloudlets = cloudlets - tiers[tiers.length - 1].value;
                    if (freeCloudlets <= tiers[tiers.length - 1].free) {
                        return tiers[tiers.length - 1].price * tiers[tiers.length - 1].value;
                    } else {
                        return tiers[tiers.length - 1].price * cloudlets;
                    }
                }
            }
        }

        function checkMaxPrice(cloudlets, tiers, minCloudlets, minTiers) {

            if (cloudlets === 0) {
                return 0;
            }

            var reservedPrice = checkPrice(minCloudlets, minTiers),
                scalingCloudlets = cloudlets - minCloudlets;

            for (var i = 0; i < tiers.length; i++) {
                if (i !== tiers.length - 1) {
                    if ((cloudlets >= tiers[i].value) && (cloudlets < tiers[i + 1].value)) {
                        if (scalingCloudlets <= tiers[i].free) {
                            return reservedPrice;
                        } else {
                            return (scalingCloudlets * tiers[i].price) + reservedPrice;
                        }
                    }
                } else {
                    if (scalingCloudlets <= tiers[tiers.length - 1].free) {
                        return reservedPrice;
                    } else {
                        return (tiers[tiers.length - 1].price * scalingCloudlets) + reservedPrice;
                    }
                }
            }
        }

        function toCurrency(nValue, sFrom, sTo) {
            return (sFrom / sTo) * nValue;
        }

        function setMinValues(el, type) {


            var value = getReservedCloudlets(el, type);

            // render line from dot to range
            var leftRange = $(el).find('.' + type + '-range .addui-slider-handle').eq(0),
                leftDot = $(el).find('.' + type + '-range .reserved .dot');
            var distance = leftRange.offset().left - $(leftDot).offset().left + $(leftDot).outerWidth() + 10;
            if (distance > 0) {
                $(leftDot).html('<span class="line more" style="width:' + (distance + 2) + 'px"></span>');
            } else {
                $(leftDot).html('<span class="line less" style="width:' + Math.abs(distance) + 'px"></span>');
            }

            // change reserved cloudlets
            var mib = convertMib(value);
            var mhz = convertMhz(value);
            $(el).find('.' + type + '-range .min-block .digits').html('<span>' + mib + '</span><span>' + mhz + '</span>')

        }

        function setMaxValues(el, type) {

            var value = getScalingCloudlets(el, type);

            // render line from dot to range
            var rightRange = $(el).find('.' + type + '-range .addui-slider-handle').eq(1),
                rightDot = $(el).find('.' + type + '-range .sl .dot');
            var distance = rightRange.offset().left - $(rightDot).offset().left + $(rightDot).outerWidth() + 10;
            if (distance > 0) {
                $(rightDot).html('<span class="line more" style="width:' + (distance + 2) + 'px"></span>');
            } else {
                $(rightDot).html('<span class="line less" style="width:' + Math.abs(distance) + 'px"></span>');
            }

            // change scaling limits
            var mib = convertMib(value);
            var mhz = convertMhz(value);
            $(el).find('.' + type + '-range .max-block .digits').html('<span>' + mib + '</span><span>' + mhz + '</span>')
        }

        fnSetDefault = function () {
            var sHosterCriteria = uniqid();
            if (JApp.isLoadedDefHoster()) {
                return fnInitDefaultHoster();
            } else {
                return JApp.loadDefaultHoster(fnInitDefaultHoster, sHosterCriteria);
            }
            bInitDefCor = false;
        };
        fnInitDefaultHoster = function (sHoster) {
            sCurrentHoster = sHoster || JApp.getDefaultHoster();
            if (calculatorsWithSelector.length > 0) {
                $.each(calculatorsWithSelector, function () {
                    renderHosterSelector($(this));
                    renderCalculator($(this));
                })
            }
        };

        $(document).on('change', '.hoster-selector--select', function (e) {
            var calculatorElement = $(this).closest(calculatorTag);
            sCurrentHoster = $(this).val();
            renderHosterSelector(calculatorElement);
            renderCalculator(calculatorElement);
        });


        if ($add === undefined) var $add = {version: {}, auto: {disabled: false}};
        $add.version.Slider = "2.0.1";
        $add.SliderObj = function (settings) {
            Obj.apply(this);

            function toNearest(num, x) {
                return (Math.round(num * (1 / x)) / (1 / x));
            }

            function betterParseFloat(t) {
                return isNaN(parseFloat(t)) && t.length > 0 ? betterParseFloat(t.substr(1)) : parseFloat(t)
            };

            this._settings = {
                direction: "horizontal",
                min: 0,
                max: 100,
                step: 0.1,
                value: 50,
                formatter: function (x) {
                    if ((this._settings.step + "").indexOf(".") > -1)
                        var digits = (this._settings.step + "").split(".").pop().length;
                    else
                        var digits = 0;
                    var v = betterParseFloat(x);
                    if (x < 0) {
                        var neg = true;
                        x = 0 - x;
                    } else {
                        var neg = false;
                    }
                    if (isNaN(x)) {
                        return "NaN";
                    }
                    var whole = Math.floor(x);
                    var dec = (x - whole);
                    dec = Math.round(dec * Math.pow(10, digits));
                    dec = dec + "";
                    while (dec.length < digits) {
                        dec = "0" + dec;
                    }
                    return ((neg) ? "-" : "") + whole + ((digits > 0) ? "." + dec : "");
                },
                timeout: 2000,
                range: false,
                id: false,
                name: "",
                class: "",
                fixed: "",
                dynamic: "",
            };
            Object.defineProperty(this, "settings", {
                get: function () {
                    this.trigger("getsetting settings", this._settings);
                    return this._settings;
                },
                set: function (newSettings) {
                    this._settings = $.extend(this._settings, settings);
                    this.trigger("setsettings settings", this._settings);
                    this.refresh();
                }
            });
            Object.defineProperty(this, "value", {
                get: function () {
                    this.trigger("getvalue value", this._settings.value);
                    return this._settings.value;
                },
                set: function (newVal) {

                    var self = this;
                    this._settings.value = newVal;

                    this._elements.find(".addui-slider-input").val(this._settings.value);
                    if (!this._settings.range) {
                        var offset = betterParseFloat(this._settings.value) - this._settings.min;
                        var per = (toNearest(offset, this._settings.step) / (this._settings.max - this._settings.min)) * 100;
                        if (this._settings.direction == "vertical") {
                            this._elements.find(".addui-slider-handle").css("bottom", per + "%");
                            this._elements.find(".addui-slider-range").css("height", per + "%");
                            this._elements.find(".addui-slider-range").css("bottom", "0%");
                        } else {
                            this._elements.find(".addui-slider-handle").css("left", per + "%");
                            this._elements.find(".addui-slider-range").css("width", per + "%");
                        }
                        this._elements.find(".addui-slider-value span").html(toFunc(this._settings.formatter).call(this, this._settings.value));
                    } else {

                        var l = (toNearest(parseFloat(this._settings.value.split(",")[0]), this._settings.step));
                        var h = (toNearest(parseFloat(this._settings.value.split(",")[1]), this._settings.step));
                        var range = this._settings.max - this._settings.min;
                        var offsetL = l - this._settings.min;
                        var offsetH = h - this._settings.min;
                        var lPer = (offsetL / range) * 100;
                        var hPer = (offsetH / range) * 100;

                        this._elements.each(function (i, el) {
                            var $el = $(el),
                                calc = $el.closest('.j-calculator'),
                                type = $($el.closest('[class*="-range"'))[0].className.replace('-range', '');

                            if (self._settings.direction == "vertical") {
                                $el.find(".addui-slider-handle").eq(0).css("bottom", lPer + "%");
                                $el.find(".addui-slider-handle").eq(1).css("bottom", hPer + "%");
                                $el.find(".addui-slider-range").css("bottom", lPer + "%").css("height", (hPer - lPer) + "%");
                            } else {
                                $el.find(".addui-slider-start-distance").css("width", "calc(" + lPer + "% + 30px)");
                                $el.find(".addui-slider-handle").eq(0).css("left", lPer + "%");
                                $el.find(".addui-slider-handle").eq(1).css("left", hPer + "%");
                                $el.find(".addui-slider-range").css("left", lPer + "%").css("width", (hPer - lPer) + "%");
                                $el.find(".addui-slider-distance").css("width", "calc(" + (100 - hPer) + "% + 31px)");
                            }

                            $('.' + type + '-range .reserved-cloudlets').html(toFunc(self._settings.formatter).call(self, l) + ' cloudlets');
                            $('.' + type + '-range .scaling-cloudlets').html(toFunc(self._settings.formatter).call(self, h) + ' cloudlets');
                            // $el.find(".addui-slider-handle").eq(0).find(".addui-slider-value span").html(toFunc(self._settings.formatter).call(self, l));
                            // $el.find(".addui-slider-handle").eq(1).find(".addui-slider-value span").html(toFunc(self._settings.formatter).call(self, h));

                            setReservedCloudlets(l, calc, type);
                            setScalingCloudlets(h, calc, type);
                            setTimeout(function () {
                                setPrice(self._settings.fixed.tiers, self._settings.dynamic.tiers, calc, self._settings.storage.tiers, self._settings.ip.tiers, self._settings.network.tiers);
                            }, 100)
                        });
                    }
                }
            });

            this.renderer = function () {
                var self = this;
                var $slider = $("<div class='addui-slider addui-slider-" + this._settings.direction + ((this._settings.range) ? " addui-slider-isrange" : "") + " " + this._settings.class + "' " + ((this._settings.id) ? "id='" + this._settings.id + "'" : "") + "></div>");
                var $input = $("<input class='addui-slider-input' type='hidden' name='" + this._settings.name + "' value='" + this._settings.value + "' />").appendTo($slider);
                var $track = $("<div class='addui-slider-track'></div>").appendTo($slider);
                var $range = $("<div class='addui-slider-range'></div>").appendTo($track);

                if (!this._settings.range) {
                    var $handle = $("<div class='addui-slider-handle'><div class='addui-slider-value'><span></span></div></div>").appendTo($track);
                    var activeTimer = null;

                    function dragHandler(e) {
                        e.preventDefault();
                        if (self._settings.direction == "vertical") {
                            if (e.type == "touchmove")
                                var y = e.originalEvent.changedTouches[0].pageY;
                            else
                                var y = e.pageY;
                            var sliderY = $slider.offset().top + $slider.height();
                            var offsetY = sliderY - y;
                            var offsetPer = (offsetY / $slider.height()) * 100;
                        } else {
                            if (e.type == "touchmove")
                                var x = e.originalEvent.changedTouches[0].pageX;
                            else
                                var x = e.pageX;
                            var sliderX = $slider.offset().left;
                            var offsetX = x - sliderX;
                            var offsetPer = (offsetX / $slider.width()) * 100;
                        }

                        var val = toNearest((offsetPer / 100) * (self._settings.max - self._settings.min), self._settings.step) + self._settings.min;
                        val = Math.min(self._settings.max, Math.max(self._settings.min, val));
                        self.value = toNearest(val, self._settings.step);

                    };

                    function dragStopHandler(e) {
                        $(window).off("mousemove touchmove", dragHandler);
                        activeTimer = setTimeout(function () {
                            $handle.removeClass("addui-slider-handle-active");
                        }, self._settings.timeout);
                    };
                    $handle.on("mousedown touchstart", function (e) {
                        clearTimeout(activeTimer);
                        $handle.addClass("addui-slider-handle-active");
                        $(window).on("mousemove touchmove dragmove", dragHandler);
                        $(window).one("mouseup touchend", dragStopHandler);
                    });
                    $slider.on("click", function (e) {
                        e.preventDefault();

                        if (self._settings.direction == "vertical") {
                            if (e.type == "touchmove")
                                var y = e.originalEvent.changedTouches[0].pageY;
                            else
                                var y = e.pageY;
                            var sliderY = $slider.offset().top + $slider.height();
                            var offsetY = sliderY - y;
                            var offsetPer = (offsetY / $slider.height()) * 100;
                        } else {
                            if (e.type == "touchmove")
                                var x = e.originalEvent.changedTouches[0].pageX;
                            else
                                var x = e.pageX;
                            var sliderX = $slider.offset().left;
                            var offsetX = x - sliderX;
                            var offsetPer = (offsetX / $slider.width()) * 100;
                        }

                        var val = toNearest((offsetPer / 100) * (self._settings.max - self._settings.min), self._settings.step) + self._settings.min;
                        val = Math.min(self._settings.max, Math.max(self._settings.min, val));
                        clearTimeout(activeTimer);
                        $handle.addClass("addui-slider-handle-active");
                        activeTimer = setTimeout(function () {
                            $handle.removeClass("addui-slider-handle-active");
                        }, self._settings.timeout);
                        self.value = val;
                    });
                } else {
                    var $startDistance = $("<div class='addui-slider-start-distance'></div>").appendTo($track);
                    var $handle1 = $("<div class='addui-slider-handle addui-slider-handle-l'><div class='addui-slider-value'><span></span></div></div>").appendTo($track);
                    var activeTimer1 = null;


                    function dragHandler1(e) {
                        e.preventDefault();
                        if (self._settings.direction == "vertical") {
                            if (e.type == "touchmove")
                                var y = e.originalEvent.changedTouches[0].pageY;
                            else
                                var y = e.pageY;
                            var sliderY = $slider.offset().top + $slider.height();
                            var offsetY = sliderY - y;
                            var range = self._settings.max - self._settings.min;
                            var offsetPer = (offsetY / $slider.height()) * 100;
                        } else {
                            if (e.type == "touchmove")
                                var x = e.originalEvent.changedTouches[0].pageX;
                            else
                                var x = e.pageX;
                            var sliderX = $slider.offset().left;
                            var offsetX = x - sliderX;
                            var range = self._settings.max - self._settings.min;
                            var offsetPer = (offsetX / $slider.width()) * 100;
                        }


                        var offsetVal = offsetPer / 100 * range;
                        var val = toNearest(offsetVal + self._settings.min, self._settings.step);
                        val = Math.min(self._settings.max, Math.max(self._settings.min, val));
                        var higherVal = toNearest(betterParseFloat(self._settings.value.split(',')[1]), self._settings.step);
                        if (higherVal < val)
                            higherVal = val;
                        self.value = val + "," + higherVal;
                    };


                    function dragStopHandler1(e) {
                        $(window).off("mousemove touchmove", dragHandler1);
                        activeTimer1 = setTimeout(function () {
                            $handle1.removeClass("addui-slider-handle-active");
                        }, self._settings.timeout);
                    };
                    $handle1.on("mousedown touchstart", function (e) {
                        clearTimeout(activeTimer1);
                        $handle1.addClass("addui-slider-handle-active");
                        $(window).on("mousemove touchmove dragmove", dragHandler1);
                        $(window).one("mouseup touchend", dragStopHandler1);
                    });

                    var $handle2 = $("<div class='addui-slider-handle addui-slider-handle-h'><div class='addui-slider-value'><span></span></div></div>").appendTo($track);
                    var activeTimer2 = null;

                    var $distance = $("<div class='addui-slider-distance'></div>").appendTo($track);


                    function dragHandler2(e) {
                        e.preventDefault();
                        if (self._settings.direction == "vertical") {
                            if (e.type == "touchmove")
                                var y = e.originalEvent.changedTouches[0].pageY;
                            else
                                var y = e.pageY;
                            var sliderY = $slider.offset().top + $slider.height();
                            var offsetY = sliderY - y;
                            var offsetPer = (offsetY / $slider.height()) * 100;
                        } else {
                            if (e.type == "touchmove")
                                var x = e.originalEvent.changedTouches[0].pageX;
                            else
                                var x = e.pageX;
                            var sliderX = $slider.offset().left;
                            var offsetX = x - sliderX;
                            var offsetPer = (offsetX / $slider.width()) * 100;
                        }
                        var range = self._settings.max - self._settings.min;
                        var offsetVal = offsetPer / 100 * range;
                        var val = toNearest(offsetVal + self._settings.min, self._settings.step);
                        val = Math.min(self._settings.max, Math.max(self._settings.min, val));
                        var lowerVal = toNearest(betterParseFloat(self._settings.value.split(',')[0]), self._settings.step);
                        if (lowerVal > val)
                            lowerVal = val;
                        self.value = lowerVal + "," + val;
                    };


                    function dragStopHandler2(e) {
                        $(window).off("mousemove touchmove", dragHandler2);
                        activeTimer2 = setTimeout(function () {
                            $handle2.removeClass("addui-slider-handle-active");
                        }, self._settings.timeout);
                    };
                    $handle2.on("mousedown touchstart", function (e) {
                        clearTimeout(activeTimer2);
                        $handle2.addClass("addui-slider-handle-active");
                        $(window).on("mousemove touchmove dragmove", dragHandler2);
                        $(window).one("mouseup touchend", dragStopHandler2);
                    });
                }
                return $slider;
            };

            this.init = function (settings) {
                var self = this;
                this.settings = settings;

                if (!this._settings.range) {
                    this._settings.value = Math.max(this._settings.min, Math.min(this._settings.max, betterParseFloat(this._settings.value)));
                } else {
                    var val = this._settings.value + "";
                    if (val.indexOf(",") > -1) { // Already has two values
                        var values = val.split(",");
                        var v1 = betterParseFloat(values[0]);
                        v1 = Math.min(this._settings.max, Math.max(this._settings.min, v1));
                        v1 = toNearest(v1, this._settings.step);

                        var v2 = betterParseFloat(values[1]);
                        v2 = Math.min(this._settings.max, Math.max(this._settings.min, v2));
                        v2 = toNearest(v2, this._settings.step);
                    } else { // Only has one value
                        var val = toNearest(Math.max(this._settings.min, Math.min(this._settings.max, betterParseFloat(this._settings.value))), this._settings.step);
                        var middle = (this._settings.max - this._settings.min) / 2;
                        if (val < middle) {
                            var v1 = val;
                            var v2 = this._settings.max - val;
                        } else {
                            var v2 = val;
                            var v1 = this._settings.min + val;
                        }
                    }
                    if (v1 < v2)
                        this._settings.value = v1 + "," + v2;
                    else
                        this._settings.value = v2 + "," + v1;
                }

                this.on("render", function () {
                    self.value = self._settings.value;
                })
                this.trigger("init", {
                    settings: this._settings
                });
            };
            this.init.apply(this, arguments);
        };

    }
);