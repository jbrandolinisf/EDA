import { LightningElement, track, wire, api } from "lwc";
import { refreshApex } from "@salesforce/apex";

import getErrorSettingsViewModel from "@salesforce/apex/ErrorSettingsController.getErrorSettingsViewModel";

import stgErrorSettingsTitle from "@salesforce/label/c.stgErrorSettingsTitle";
import stgStoreErrorsTitle from "@salesforce/label/c.stgStoreErrorsTitle";
import stgHelpStoreErrorsOn from "@salesforce/label/c.stgHelpStoreErrorsOn";
import stgSendErrorsTitle from "@salesforce/label/c.stgSendErrorsTitle";
import stgOptSelect from "@salesforce/label/c.stgOptSelect";
import stgHelpErrorNotifyOn from "@salesforce/label/c.stgHelpErrorNotifyOn";
import stgErrorNotifRecipientsTitle from "@salesforce/label/c.stgErrorNotifRecipientsTitle";
import stgHelpErrorNotifyTo from "@salesforce/label/c.stgHelpErrorNotifyTo";
import stgEnableDebugTitle from "@salesforce/label/c.stgEnableDebugTitle";
import stgEnableDebugHelp from "@salesforce/label/c.stgEnableDebugHelp";
import stgDisableErrorHandlingTitle from "@salesforce/label/c.stgDisableErrorHandlingTitle";
import stgHelpErrorDisable from "@salesforce/label/c.stgHelpErrorDisable";

const errorNotificationRecipientCategoryAllSysAdmins = "All Sys Admins";
export default class ErrorSettings extends LightningElement {
    isEditMode = false;
    affordancesDisabledToggle = false;

    @track errorSettingsWireResult;
    @track errorSettingsVModel;

    labelReference = {
        errorSettingsTitle: stgErrorSettingsTitle,
        storeErrorsSettingTitle: stgStoreErrorsTitle,
        storeErrorsSettingDescription: stgHelpStoreErrorsOn,
        sendErrorsSettingTitle: stgSendErrorsTitle,
        sendErrorsSettingDescription: stgHelpErrorNotifyOn,
        errorNotificationRecipientsTitle: stgErrorNotifRecipientsTitle,
        errorNotificationRecipientsDescription: stgHelpErrorNotifyTo,
        comboboxPlaceholderText: stgOptSelect,
        enableDebugSettingsTitle: stgEnableDebugTitle,
        enableDebugSettingsDescription: stgEnableDebugHelp,
        errorHandlingSettingTitle: stgDisableErrorHandlingTitle,
        errorHandlingSettingDescription: stgHelpErrorDisable,
    };

    inputAttributeReference = {
        storeErrorsToggleId: "storeErrors",
        sendErrorNotificationsToggleId: "sendErrorNotifications",
        errorNotificationRecipientsComboboxId: "errorNotificationRecipients",
        enableDebugToggleId: "enableDebug",
        errorHandlingToggleId: "errorHandling",
    };

    get affordancesDisabled() {
        if (!this.isEditMode || this.affordancesDisabledToggle === true) {
            return true;
        }
        return undefined;
    }

    @api
    handleSaveCanvasRender() {
        this.template.querySelector("c-settings-save-canvas").focusOnTitle();
    }

    @wire(getErrorSettingsViewModel)
    errorSettingsVModelWire(result) {
        this.errorSettingsWireResult = result;

        if (result.data) {
            this.errorSettingsVModel = result.data;
        } else if (result.error) {
            //console.log("error retrieving errorSettingsVModel");
        }
    }

    handleStoreErrorsChange(event) {
        const eventDetail = event.detail;

        let hierarchySettingsChange = {
            settingsType: "boolean",
            settingsName: "Store_Errors_On__c",
            settingsValue: eventDetail.value,
        };

        this.template.querySelector("c-settings-save-canvas").handleHierarchySettingsChange(hierarchySettingsChange);
    }

    handleSendErrorNotificationsChange(event) {
        const eventDetail = event.detail;

        let hierarchySettingsChange = {
            settingsType: "boolean",
            settingsName: "Error_Notifications_On__c",
            settingsValue: eventDetail.value,
        };

        this.template.querySelector("c-settings-save-canvas").handleHierarchySettingsChange(hierarchySettingsChange);
    }

    handleErrorNotificationRecipientCategoryChange(event) {
        const eventDetail = event.detail;

        if (event.detail.value !== errorNotificationRecipientCategoryAllSysAdmins) {
            return;
        }

        let hierarchySettingsChange = {
            settingsType: "string",
            settingsName: "Error_Notifications_To__c",
            settingsValue: eventDetail.value,
        };

        this.template.querySelector("c-settings-save-canvas").handleHierarchySettingsChange(hierarchySettingsChange);
    }

    handleEnableDebugChange(event) {
        const eventDetail = event.detail;

        let hierarchySettingsChange = {
            settingsType: "boolean",
            settingsName: "Enable_Debug__c",
            settingsValue: eventDetail.value,
        };

        this.template.querySelector("c-settings-save-canvas").handleHierarchySettingsChange(hierarchySettingsChange);
    }

    handleErrorHandlingChange(event) {
        const eventDetail = event.detail;

        let hierarchySettingsChange = {
            settingsType: "boolean",
            settingsName: "Disable_Error_Handling__c",
            settingsValue: !eventDetail.value, // UI input should display inverse of value specified in hierarchy settings for this field
        };

        this.template.querySelector("c-settings-save-canvas").handleHierarchySettingsChange(hierarchySettingsChange);
    }

    handleSettingsEditModeChange(event) {
        this.isEditMode = !event.detail;
        this.affordancesDisabledToggle = event.detail;
    }

    handleSettingsSaveCancel(event) {
        this.refreshAllApex();
    }

    handleSettingsSaving(event) {
        this.affordancesDisabledToggle = true;
        // TODO: perform client side validation

        // if validation fails, call this.handleValidationFailure()
        //this.template.querySelector("c-settings-save-canvas").handleValidationFailure();

        // else, update hierarchy settings
        this.template.querySelector("c-settings-save-canvas").updateHierarchySettings();
    }

    handleSettingsSaveCompleted(event) {
        this.affordancesDisabledToggle = false;
        this.refreshAllApex();
    }

    refreshAllApex() {
        Promise.all([refreshApex(this.errorSettingsWireResult)]).then(() => {
            this.template.querySelectorAll("c-settings-row-input").forEach((input) => {
                input.resetValue();
            });
        });
    }
}
