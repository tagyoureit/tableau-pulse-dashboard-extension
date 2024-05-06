"use strict";
// import {ISettings} from './Interface';
// this import statement causes object definition errors to load in the browser.  :( 
// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
    /**
     * This extension collects the IDs of each datasource the user is interested in
     * and stores this information in settings when the popup is closed.
     */
    let settings;
    $(function () {
        // The only difference between an extension in a dashboard and an extension
        // running in a popup is that the popup extension must use the method
        // initializeDialogAsync instead of initializeAsync for initialization.
        // This has no affect on the development of the extension but is used internally.
        tableau.extensions.initializeDialogAsync().then(function (settingsStr) {
            $('#closeButton').on('click', closeDialog);
            // const dashboard = tableau.extensions.dashboardContent.dashboard;
            const allSettings = tableau.extensions.settings.getAll();
            let settingsDefault = { ...JSON.parse(settingsStr) };
            settings = {
                tableauUrl: allSettings.tableauUrl || settingsDefault.tableauUrl,
                siteName: allSettings.siteName || settingsDefault.siteName,
                userName: allSettings.userName || settingsDefault.userName,
                caClientId: allSettings.caClientId || settingsDefault.caClientId,
                caSecretId: allSettings.caSecretId || settingsDefault.caSecretId,
                caSecretValue: allSettings.caSecretValue || settingsDefault.caSecretValue
            };
            // $('#tableauUrl').val(settings.tableauUrl.replace(/"/g, ''));
            // Extract the relevant part from the URL (e.g., "ew1a")
            let tableauUrl = 'prod-apsoutheast-a';
            if (typeof settings.tableauUrl !== 'undefined') {
                let match = settings.tableauUrl.match(/https:\/\/([^.]+)\.online\.tableau\.com/);
                if (match && match.length > 1) {
                    // Set the value of the dropdown to the extracted part of the URL
                    tableauUrl = match[1];
                }
            }
            ;
            $('#tableauUrl').val(tableauUrl);
            // Check if the match was found
            $('#userName').val(settings.userName.replace(/"/g, ''));
            $('#siteName').val(settings.siteName.replace(/"/g, ''));
            $('#caClientId').val(settings.caClientId.replace(/"/g, ''));
            $('#caSecretId').val(settings.caSecretId.replace(/"/g, ''));
            $('#caSecretValue').val(settings.caSecretValue.replace(/"/g, ''));
            attachEventListeners();
        });
    });
    /**
     * UI helper that adds a checkbox item to the UI for a datasource.
     */
    function attachEventListeners() {
        // Set Tableau URL
        $('#tableauUrl').on('change', function () {
            console.log($(this).val());
            console.log($(this).val());
            settings.tableauUrl = `https://${$(this).val()}.online.tableau.com`;
            console.log(JSON.stringify(settings, null, 2));
        });
        // Set Site Name
        $('#siteName').on('change', function () {
            settings.siteName = $(this).val();
        });
        // Set User Name
        $('#userName').on('change', function () {
            settings.userName = $(this).val();
        });
        // Set Client ID
        $('#caClientId').on('change', function () {
            settings.caClientId = $(this).val();
        });
        // Set Secret ID
        $('#caSecretId').on('change', function () {
            settings.caSecretId = $(this).val();
        });
        // Set Secret Value
        $('#caSecretValue').on('change', function () {
            settings.caSecretValue = $(this).val();
        });
    }
    /**
     * Stores the selected datasource IDs in the extension settings,
     * closes the dialog, and sends a payload back to the parent.
     */
    function closeDialog() {
        tableau.extensions.settings.set('tableauUrl', settings.tableauUrl);
        tableau.extensions.settings.set('siteName', settings.siteName);
        tableau.extensions.settings.set('userName', settings.userName);
        tableau.extensions.settings.set('caClientId', settings.caClientId);
        tableau.extensions.settings.set('caSecretId', settings.caSecretId);
        tableau.extensions.settings.set('caSecretValue', settings.caSecretValue);
        // Function to remove event listeners for all input elements
        function removeEventListeners() {
            $('input').off('change');
        }
        tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
            console.log('closing...');
            console.log(settings);
            console.log(JSON.stringify('settings'));
            tableau.extensions.ui.closeDialog(JSON.stringify(settings));
        }).catch((err) => {
            console.log(`an error occurred closing the dialogue box: ${err} ${err.stack}`);
        });
    }
})();
//# sourceMappingURL=PulseDashboardExtensionDialog.js.map