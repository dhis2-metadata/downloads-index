$(document).ready(function() {
  var jsonData = {}; // Your JSON data object
  var flatJson = [];
  var selections = {};

  nunjucks.configure("resources/templates", { autoescape: true });

  function flattenJson(json) {
    const flattenedJson = [];

    json.areas.forEach(area => {
      area.packages.forEach(package => {
        package.packageVersions.forEach(version => {
          version.translations.forEach(translation => {
            translation.dhis2Versions.forEach(dhisver => {
              // const packageName = package.name;

              flattenedJson.push({
                areaName: area.area,
                packageName: package.name,
                packageVersion: version.version,
                releaseDate: version.releaseDate,
                language: translation.language,
                dhis2Version: dhisver.version,
                url: dhisver.url
              });
            });
          });
        });
      });
    });

    return flattenedJson;
  }

  // Function to populate the table based on selected filters
  function populateTable() {
    var area = $("#area-selector").val();

    // Filter the data
    var filteredData = flatJson.slice();
    // get the div with id "td-wrapper" to insert the filtered data
    var wrapper = document.getElementById("td-wrapper");
    wrapper.innerHTML = "";

    if (area !== "none" && area !== "") {
      filteredData = filteredData.filter(function(item) {
        return item.areaName === area;
      });

      // create a list of packages in the filtered data
      var packages = [];
      $.each(filteredData, function(i, item) {
        if (packages.indexOf(item.packageName) === -1) {
          packages.push(item.packageName);
        }
      });


      // loop over the packages and filter the data for each package
      $.each(packages, function(i, item) {
        var package = packages[i];

        var packageData = filteredData.filter(function(item) {
          return item.packageName === package;
        });

        // console.log("package: " + package);

        // if selections[area][package] is defined, set its value to the variable "selected"
        var selected =
          selections[area] && selections[area][package]
            ? selections[area][package]
            : "";

        // create a list of versions in the filtered data, and the latest version
        var versions = [];
        var latestVersion = "";
        $.each(packageData, function(i, item) {
          //console.log(item);
          if (versions.indexOf(item.packageVersion) === -1) {
            versions.push(item.packageVersion);
          }
        });
        if (selected !== "") {
          // console.log("selected NOT EMPTY: " + selected);
          latestVersion = selected["version"];
        } else {
          // console.log("selected EMPTY: " + selected);
          latestVersion = versions.sort().reverse()[0];
        }

        // Filter the data again to only include the latest version
        packageData = packageData.filter(function(item) {
          return item.packageVersion === latestVersion;
        });

        // create a list of dhis2 versions in the filtered data, and the latest version
        var dhis2Versions = [];
        var latestDhis2Version = "";
        $.each(packageData, function(i, item) {
          if (dhis2Versions.indexOf(item.dhis2Version) === -1) {
            dhis2Versions.push(item.dhis2Version);
          }
        });
        var fallBackDhis2Version = dhis2Versions.sort().reverse()[0];
        if (selected !== "") {
          latestDhis2Version = selected["dhis2Version"];
        } else {
          latestDhis2Version = fallBackDhis2Version;
        }

        // check if there are any records in the filtered data with the latest dhis2 version
        var dhis2VersionExists = false;
        $.each(packageData, function(i, item) {
          if (item.dhis2Version === latestDhis2Version) {
            dhis2VersionExists = true;
          }
        });

        // Filter the data again to only include the latest dhis2 version
        if (dhis2VersionExists) {
          packageData = packageData.filter(function(item) {
            return item.dhis2Version === latestDhis2Version;
          });
        } else {
          packageData = packageData.filter(function(item) {
            return item.dhis2Version === fallBackDhis2Version;
          });
        }

        // create a list of languages in the filtered data, and the default language
        var languages = [];
        var defaultLanguage = "en";
        $.each(packageData, function(i, item) {
          if (languages.indexOf(item.language) === -1) {
            languages.push(item.language);
          }
        });
        var fallBackLanguage = languages[0];
        if (selected !== "") {
          defaultLanguage = selected["language"];
        } else {
          if (languages.indexOf(defaultLanguage) === -1) {
            defaultLanguage = languages[0];
          }
        }

        // check if there are any records in the filtered data with the default language
        var languageExists = false;
        $.each(packageData, function(i, item) {
          if (item.language === defaultLanguage) {
            languageExists = true;
          }
        });

        // Filter the data again to only include the default language
        if (languageExists) {
          packageData = packageData.filter(function(item) {
            return item.language === defaultLanguage;
          });
        } else {
          packageData = packageData.filter(function(item) {
            return item.language === fallBackLanguage;
          });
        }

        // add the filtered data inside the wrapper, using a template
        $.each(packageData, function(i, item) {
          //console.log(item.dhis2Version);
          var dlName = item.url.split("/").pop();
          var context = {
            name: item.packageName,
            subtitle: area,
            versions: versions.sort().reverse(),
            version: item.packageVersion,
            releaseDate: item.releaseDate,
            dhis2Version: item.dhis2Version,
            dhis2Versions: dhis2Versions.sort().reverse(),
            language: item.language,
            languages: languages,
            url: item.url,
            downloadName: dlName
          };
          // console.log(context);
          var html = nunjucks.render("card.html", context);
          wrapper.innerHTML += html;
        });
      });
    } 
    else {
      // if there are no records in the filtered data, add a message to the wrapper
      var html = nunjucks.render("card-intro.html", {});
      wrapper.innerHTML = html;
    }
  }


  // Load the JSON data and populate the table
  $.getJSON("index.json", function(data) {
    jsonData = data;
    flatJson = flattenJson(jsonData);


    // populate the area selector if there isn't already a selection with that value

    $.each(jsonData.areas, function(i, item) {
      if ($("#area-selector option[value='" + item.area + "']").length == 0) {
        $("#area-selector").append(
          '<option value="' + item.area + '">' + item.area + "</option>"
        );
      }
    });

    // populate the package selector filtered by area
    $("#area-selector").on("change", function() {
      $("#area-selector").blur();
      populateTable();
    });

    // trigger the area selector change event
    $("#area-selector").trigger("change");

  });

  window.inCardChange = function(package, ver, dver, lang) {
    var area = $("#area-selector").val();
    // Check if selections.area exists
    if (!selections[area]) {
      selections[area] = {}; // Create selection.area if it doesn't exist
    }

    // Update selection.area.package.version
    selections[area][package] = {
      version: ver,
      dhis2Version: dver,
      language: lang
    };

    // Update the table
    populateTable();
  };
});
