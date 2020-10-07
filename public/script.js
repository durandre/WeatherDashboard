var weatherAPIkey = "d509937c8c3c497ffa1b3e76bc40caf0"
var weatherHost = "https://api.openweathermap.org"

function determineCloudliness(cloud_coverPercent) {
    if (cloud_coverPercent <= 20) {
        return "mostly-sunny";
    } else if (cloud_coverPercent <= 50) {
        return "partly-sunny";
    } else if (cloud_coverPercent <= 70) {
        return "mostly-cloudy";
    } else
        return "cloudy";
}

function parseDailyForecast(data) {
    var date = new Date(data.dt * 1000);
    return {
        coords: { lat: data.coord.lat, long: data.coord.lon, hi: 1 },
        city: data.name,
        date: date.getMonth() + 1 + "/" + data.getFullYear(),
        temp: data.main.temp,
        feels_like: data.main.feel_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        weather_icon: "https://www.openweathermap.org/img/wn/" + data.weather[0].icon + ".png"

    };
}

function fetchDailyForecast(city) {
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=[weatherAPIkey]`;

    $.get(apiURL, data => {
        var current = parseDailyForecast(data);
        console.log(current);

        var $daily = $("section.daily")
        $daily.find(".city").text(current.city);
        $daily.find(".date").text(current.date);
        $daily.find(".weather_icon").attr("src", current.weather_icon);

        var $current = $daily.find(".current-weather");
        $current.find(".temperature").text(current.temp + "°F");
        $current.find(".feels_like").text(current.feels_like + "°F");
        $current.find(".humidity").text(current.humidity + "%");
        $current.find(".wind_speed").text(current.wind_speed + "MPH");

        $daily.show();
    }
    )
}
function fetch5DaySummary(city) {
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=[weatherAPIkey]`;
    $.get(apiURL).done(response => {
        var forecasts = parse5DaySummary(response);
        console.log(forecasts);

        var $forecasts = $("section.forecast");
        let $dailyForecast = forecast.find(".daily");

        $dailyForecast.remove();

        forecasts.forEach(daily => {
            $dailyForecast = $dailyForecast.first().clone()
            $dailyForecast.find(".date").text(daily.date);
            $dailyForecast.find(".weather_icon").attr("src", daily.weather_icon);
            $dailyForecast.find(".temperature").text(daily.temp.high + "°F /" + daily.temp.low + "°F");
            $dailyForecast.find(".humidity").text(daily.humidity + "%");

            $forecasts.append($dailyForecast);
        });

        $forecasts.show();
    });
}

function parse5DaySummary(dailyData) {
    if (!dailyData || !dailyData.list || !dailyData.list[0].dt_txt || !dailyData.list[0].main) {
        throw "couldn't parse the OpenWeather API data.";
    }

    var days = [];
    var currentDay = null;
    daily.Data.list.forEach(threeHourSummary => {
        var jsDate = new Date(threeHourSummary.dt * 1000);
        var date = jsDate.getMonth() + 1 + "/" + jsDate.getDate() + "/" + jsDate.getFullYear();

        if (!currentDay || currentDay.date !== date) {
            if (currentDay) {
                days.push(currentDay);
            }

            currentDay = {
                date: date,
                temp: { high: null, low: null },
                humidity: null,
                cloud_cover: null,
                weather_icon: null
            };
        }
        if (!currentDay.temp.high || threeHourSummary.main.temp_max > currentDay.temp.high) {
            currentDay.temp.high = threeHourSummary.main.temp_max;
        }
        if (!currentDay.temp.low || threeHourSummary.main.temp_min < currentDay.temp.low) {
            currentDay.temp.low = threeHourSummary.main.temp_min;
        }
        if (!currentDay.temp.high || threeHourSummary.main.humidity > currentDay.humidity) {
            currentDay.temp.high = threeHourSummary.main.humidity;
        }

        if (threeHourSummary.dt_txt.split("")[1] === "15:00:00") {
            currentDay.wind = threeHourSummary.wind;
            currentDay.cloud_cover = determineCloudliness(threeHourSummary.clouds.all);
            currentDay.weather_icon = "https://www.openweathermap.org/img/wn/" + threeHourSummary.weather[0].icon + ".png";
        }
    })

    return days;

}

function displayWeather(location) {
    fetchDailyForecast(location);
    fetch5DaySummary(location);
}

$(document).ready()
$("input#location").keypress(function (e) {
    if (e.which === 13) {
        displayWeather(this.value);
    }
});

$("#search button.search").click(function () {
    displayWeather($("input#location").val());

});

$("section#cities ul a").click(function (e) {
    displayWeather($(this.text())
    ,);


}
)
