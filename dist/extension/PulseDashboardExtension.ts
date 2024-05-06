
// import { tableau } from '../lib/tableau.extensions.1.latest.js';
import { DataType, DialogStyle, SettingsChangedEvent, TableauEventHandlerFn } from '@tableau/extensions-api-types';
import { ISettings } from './Interface';
// import axios from 'axios';
// import CryptoJS = require('crypto-js');
// import uuid = require('uuid');


/**
 * UINamespace Sample Extension
 *
 * This sample extension demonstrates how to use the UI namespace
 * to create a popup dialog with additional UI that the user can interact with.
 * The content in this dialog is actually an extension as well (see the
 * uiNamespaceDialog.js for details).
 *
 * This sample is an extension that auto refreshes datasources in the background of
 * a dashboard.  The extension has little need to take up much dashboard space, except
 * when the user needs to adjust settings, so the UI namespace is used for that.
 */

// Wrap everything in an anonymous function to avoid polluting the global namespace
let loading = 0;  // increment every time we start a load; decrement when done.  Only load if loading = 0;
(function () {
  let settings: ISettings;

  $(function () {

    // When initializing an extension, an optional object is passed that maps a special ID (which
    // must be 'configure') to a function.  This, in conjuction with adding the correct context menu
    // item to the manifest, will add a new "Configure..." context menu item to the zone of extension
    // inside a dashboard.  When that context menu item is clicked by the user, the function passed
    // here will be executed.
    tableau.extensions.initializeAsync({ configure: configure as () => {} }).then(async function () {
      // This event allows for the parent extension and popup extension to keep their
      // settings in sync.  This event will be triggered any time a setting is
      // changed for this extension, in the parent or popup (i.e. when settings.saveAsync is called).
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, async (settingsEvent) => {
        console.log(`Settings updated`);
        settings = { ...((settingsEvent as SettingsChangedEvent).newSettings as any as ISettings) };
        // updateExtensionBasedOnSettings((settingsEvent as SettingsChangedEvent).newSettings);
        await loadPulseMetrics();
      });
      let loadSettings = tableau.extensions.settings.getAll() as any as ISettings;
      settings = { ...loadSettings };
      if (typeof settings !== 'undefined') {
        await loadPulseMetrics();
      }
      else {
        const statusMessage = document.getElementById("statusMessage");
        if (statusMessage === null) return;
        statusMessage.style.display = 'block';
        statusMessage.innerHTML = `Configure Dashboard Extension to load metrics.`;
        configure();
      }
      return {};
    });
  });

  const configure = () => {
    // This uses the window.location.origin property to retrieve the scheme, hostname, and
    // port where the parent extension is currently running, so this string doesn't have
    // to be updated if the extension is deployed to a new location.
    const popupUrl = `${window.location.origin}/extension/PulseDashboardExtensionDialog.html`;

    /**
     * This is the API call that actually displays the popup extension to the user.  The
     * popup is always a modal dialog.  The only required parameter is the URL of the popup,co
     * which must be the same domain, port, and scheme as the parent extension.
     *
     * The developer can optionally control the initial size of the extension by passing in
     * an object with height and width properties.  The developer can also pass a string as the
     * 'initial' payload to the popup extension.  This payload is made available immediately to
     * the popup extension.  In this example, the value '5' is passed, which will serve as the
     * default interval of refresh.
     */
    if (typeof settings === 'undefined' || Object.keys(settings).length === 0) {
      settings = {
        caClientId: '6b828aa5-dd31-4c35-9be9-fddf7e0b7933',
        caSecretId: 'd7949278-f28e-48cf-8313-765c17972961',
        caSecretValue: 'dwPRgqnLDAO4G5GOrgmnylkAK5ODXxKfS/hEhTyZtzA=',
        siteName: 'rgdemosite',
        tableauUrl: 'https://10az.online.tableau.com',
        userName: 'rgoldin@salesforce.com',
      };
    }
    tableau.extensions.ui
      .displayDialogAsync(popupUrl, JSON.stringify(settings), { height: 600, width: 500 })
      .then(async (closePayload) => {
        // The promise is resolved when the dialog has been expectedly closed, meaning that
        // the popup extension has called tableau.extensions.ui.closeDialog.
        // $('#inactive').hide();
        // $('#active').show();

        settings = { ...JSON.parse(closePayload) };
        console.log(`settings updated from closePayload: ${JSON.stringify(settings, null, 2)}`);
        await loadPulseMetrics()
        // The close payload is returned from the popup extension via the closeDialog method.
        // $('#interval').text(closePayload);
        // setupRefreshInterval(closePayload);
      })
      .catch((error) => {
        // One expected error condition is when the popup is closed by the user (meaning the user
        // clicks the 'X' in the top right of the dialog).  This can be checked for like so:
        switch (error.errorCode) {
          case tableau.ErrorCodes.DialogClosedByUser:
            console.log('Dialog was closed by user');
            break;
          default:
            console.error(error.message);
        }
      });
  };


  async function loadPulseMetrics() {
    // Get a reference to the iframe element
    const iframe = document.getElementById('myIframe') as HTMLIFrameElement;

    // Set the URL you want to load
    // const url = 'https://10az.online.tableau.com/pulse/site/rgdemosite/';
    // const url = 'http://localhost:3000/data';
    // const url = 'http://localhost:3000/pulseDashboardExtension';

    // // Set the src attribute of the iframe to the desired URL
    // iframe.src = url;
    if (loading === 0) {
      loading = 1;
      await frontOriginalAsync();
      loading = 0;
    }
    else {
      // skip
    }


  }
  async function frontOriginalAsync() {
    console.log(`Loading front end.`);
    // const myApiResponse = await fetch("http://localhost:3000/data")
    // Configure the fetch request
    let parsedResponse;
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    };
    console.log(`sending payload: ${JSON.stringify(requestOptions, null, 2)}`)
    let dynamicHeader = document.getElementById('dynamicHeader');

    const statusMessage = document.getElementById("statusMessage");
    const container = document.getElementById("metricList");
    if (dynamicHeader === null || container === null || statusMessage === null) return;
    container.innerHTML = "";
    // dynamicHeader.style.display = 'block';
    dynamicHeader.style.display = 'none';
    statusMessage.style.display = 'block';
    statusMessage.classList.add("metric-card-title");
    statusMessage.innerHTML = `Loading Pulse Metric(s)...`;
    // Send the PUT request
    try {
      const myApiResponse = await fetch("http://localhost:3000/data", requestOptions);
      parsedResponse = await myApiResponse.json();
      if (myApiResponse.ok) {
        // PUT request was successful
        console.log("PUT request successful");
        statusMessage.style.display = 'none';
      } else {
        // Handle errors if the PUT request was not successful
        console.error("PUT request failed:", myApiResponse.status);
        statusMessage.style.display = 'block';
        statusMessage.innerHTML = `Error: ${parsedResponse.error}`;
        return;
      }
    } catch (error) {
      // Handle network errors
      console.error("Network error:", error);
    }
    let body = document.querySelector("body");


    let metricsFollowed = parsedResponse.definitionsArray.length;
    let mV = document.getElementById('metricsValue')
    if (mV !== null) mV.innerText = metricsFollowed;

    console.log(typeof (parsedResponse));
    console.log(parsedResponse);
    let n = parsedResponse.definitionsArray.length;



    for (let i = 0; i < n; i++) {
      const card = document.createElement("li");
      card.classList.add("_card_w86tc_1");
      const heading1 = document.createElement("h1");
      heading1.textContent = parsedResponse.definitionsArray[i].definition.metadata.name;
      heading1.classList.add("metric-card-title");

      // Build a RoundCircle with the direction.
      const direction = document.createElement("p");
      direction.textContent = "# of metrics: " + parsedResponse.definitionsArray[i].definition.total_metrics;
      if (parsedResponse.insights[i].insight_groups[0].insights[0].result.facts.difference.direction == "flat") {
        direction.textContent = "flat";
        direction.classList.add("roundCircleFlat");
      } else if (parsedResponse.insights[i].insight_groups[0].insights[0].result.facts.difference.direction == "down") {
        direction.textContent = parsedResponse.insights[i].insight_groups[0].insights[0].result.facts.difference.direction;
        direction.classList.add("roundCircleDown");
      }
      else {
        direction.textContent = parsedResponse.insights[i].insight_groups[0].insights[0].result.facts.difference.direction;
        direction.classList.add("roundCircleUp");
      }
      direction.classList.add("roundCircle");

      const contentContainer = document.createElement("div");
      contentContainer.classList.add("content-container");
      contentContainer.appendChild(heading1);
      contentContainer.appendChild(direction);
      card.appendChild(contentContainer);

      const description = document.createElement("p");
      if (parsedResponse.definitionsArray[i].definition.metadata.description == "") {
        description.textContent = "The metric does not have a description.";
      } else {
        description.textContent = parsedResponse.definitionsArray[i].definition.metadata.description;
      }
      description.classList.add("metric-card-granularity");
      card.appendChild(description);

      const ban = document.createElement("p");
      ban.textContent = parsedResponse.insights[i].insight_groups[0].insights[0].result.facts.target_period_value.formatted;
      ban.classList.add("ban-number");

      const detailsContainer = document.createElement("div");
      detailsContainer.classList.add("moreDetails-container");
      detailsContainer.appendChild(ban);
      card.appendChild(detailsContainer);

      const loopContainer = document.createElement("div");
      loopContainer.classList.add("loop-container");

      for (let j = 0; j < parsedResponse.detailInsights[i].insight_groups[3].insights.length; j++) {
        const singleContainer = document.createElement("div");
        singleContainer.classList.add("single-container");

        const insightType = document.createElement("p");
        insightType.textContent = parsedResponse.detailInsights[i].insight_groups[3].insights[j].insight_type;
        insightType.classList.add("insightType-text");
        // detailsContainer.appendChild(insightType);

        const question = document.createElement("p");
        question.textContent = parsedResponse.detailInsights[i].insight_groups[3].insights[j].result.question;
        question.classList.add("question-text");
        // detailsContainer.appendChild(question);

        const markup = document.createElement("p");
        markup.textContent = parsedResponse.detailInsights[i].insight_groups[3].insights[j].result.markup;
        markup.classList.add("markup-text");
        // detailsContainer.appendChild(markup);

        singleContainer.appendChild(insightType);
        singleContainer.appendChild(question);
        singleContainer.appendChild(markup);
        loopContainer.appendChild(singleContainer);
      }

      const insightContainer = document.createElement("div");
      insightContainer.classList.add("insight-container-container");
      insightContainer.appendChild(loopContainer);
      detailsContainer.appendChild(insightContainer);

      if (container !== null) container.appendChild(card);
    }

    const sideBarLu = document.getElementById("menuBarList");

    parsedResponse.definitionsArray.forEach((item: any) => {
      const liElement = document.createElement("li");
      liElement.textContent = item.definition.metadata.name;
      liElement.classList.add('menu');
      if (sideBarLu !== null) sideBarLu.appendChild(liElement);
    })
    // $('#extension_frame').contentWindow.document.getElementsByClassName('menu')[0].classList.add('hidden')
    document.getElementsByClassName('menu')[0].classList.add('hidden');

  }

  // function nextDetail(ev) {
  //     let singleDetails = document.querySelector(".single-container");
  //     let width = singleDetails.getBoundingClientRect().width;
  //     let loopContainer = document.querySelector(".loop-container");
  //     loopContainer.left = loopContainer.left - width;
  // }
})();
