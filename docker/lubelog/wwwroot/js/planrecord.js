﻿function showAddPlanRecordModal() {
    $.get('/Vehicle/GetAddPlanRecordPartialView', function (data) {
        if (data) {
            $("#planRecordModalContent").html(data);
            //initiate datepicker
            initDatePicker($('#planRecordDate'));
            $('#planRecordModal').modal('show');
        }
    });
}
function showEditPlanRecordModal(planRecordId, nocache) {
    if (!nocache) {
        var existingContent = $("#planRecordModalContent").html();
        if (existingContent.trim() != '') {
            //check if id is same.
            var existingId = getPlanRecordModelData().id;
            var isNotTemplate = !getPlanRecordModelData().isTemplate;
            if (existingId == planRecordId && isNotTemplate && $('[data-changed=true]').length > 0) {
                $('#planRecordModal').modal('show');
                $('.cached-banner').show();
                return;
            }
        }
    }
    $.get(`/Vehicle/GetPlanRecordForEditById?planRecordId=${planRecordId}`, function (data) {
        if (data) {
            $("#planRecordModalContent").html(data);
            //initiate datepicker
            initDatePicker($('#planRecordDate'));
            $('#planRecordModal').modal('show');
            bindModalInputChanges('planRecordModal');
            $('#planRecordModal').off('shown.bs.modal').on('shown.bs.modal', function () {
                if (getGlobalConfig().useMarkDown) {
                    toggleMarkDownOverlay("planRecordNotes");
                }
            });
        }
    });
}
function showEditPlanRecordTemplateModal(planRecordTemplateId, nocache) {
    hidePlanRecordTemplatesModal();
    if (!nocache) {
        var existingContent = $("#planRecordModalContent").html();
        if (existingContent.trim() != '') {
            //check if id is same.
            var existingId = getPlanRecordModelData().id;
            var isTemplate = getPlanRecordModelData().isTemplate;
            if (existingId == planRecordTemplateId && isTemplate && $('[data-changed=true]').length > 0) {
                $('#planRecordModal').modal('show');
                $('.cached-banner').show();
                return;
            }
        }
    }
    $.get(`/Vehicle/GetPlanRecordTemplateForEditById?planRecordTemplateId=${planRecordTemplateId}`, function (data) {
        if (data) {
            $("#planRecordModalContent").html(data);
            //initiate datepicker
            initDatePicker($('#planRecordDate'));
            $('#planRecordModal').modal('show');
            bindModalInputChanges('planRecordModal');
            $('#planRecordModal').off('shown.bs.modal').on('shown.bs.modal', function () {
                if (getGlobalConfig().useMarkDown) {
                    toggleMarkDownOverlay("planRecordNotes");
                }
            });
        }
    });
}
function hideAddPlanRecordModal() {
    $('#planRecordModal').modal('hide');
        if (getPlanRecordModelData().createdFromReminder) {
            //show reminder Modal
            $("#reminderRecordModal").modal("show");
        }
        if (getPlanRecordModelData().isTemplate) {
            showPlanRecordTemplatesModal();
        }
}
function deletePlanRecord(planRecordId, noModal) {
    $("#workAroundInput").show();
    Swal.fire({
        title: "Confirm Deletion?",
        text: "Deleted Plan Records cannot be restored.",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#dc3545"
    }).then((result) => {
        if (result.isConfirmed) {
            $.post(`/Vehicle/DeletePlanRecordById?planRecordId=${planRecordId}`, function (data) {
                if (data) {
                    if (!noModal) {
                        hideAddPlanRecordModal();
                    }
                    successToast("Plan Record Deleted");
                    var vehicleId = GetVehicleId().vehicleId;
                    getVehiclePlanRecords(vehicleId);
                } else {
                    errorToast(genericErrorMessage());
                }
            });
        } else {
            $("#workAroundInput").hide();
        }
    });
}
function savePlanRecordToVehicle(isEdit) {
    //get values
    var formValues = getAndValidatePlanRecordValues();
    //validate
    if (formValues.hasError) {
        errorToast("Please check the form data");
        return;
    }
    //save to db.
    $.post('/Vehicle/SavePlanRecordToVehicleId', { planRecord: formValues }, function (data) {
        if (data) {
            successToast(isEdit ? "Plan Record Updated" : "Plan Record Added.");
            hideAddPlanRecordModal();
            if (!getPlanRecordModelData().createdFromReminder) {
                saveScrollPosition();
                getVehiclePlanRecords(formValues.vehicleId);
                if (formValues.addReminderRecord) {
                    setTimeout(function () { showAddReminderModal(formValues); }, 500);
                }
            }
        } else {
            errorToast(genericErrorMessage());
        }
    })
}
function showPlanRecordTemplatesModal() {
    var vehicleId = GetVehicleId().vehicleId;
    $.get(`/Vehicle/GetPlanRecordTemplatesForVehicleId?vehicleId=${vehicleId}`, function (data) {
        if (data) {
            $("#planRecordTemplateModalContent").html(data);
            $('#planRecordTemplateModal').modal('show');
        }
    });
}
function hidePlanRecordTemplatesModal() {
    $('#planRecordTemplateModal').modal('hide');
}
function usePlannerRecordTemplate(planRecordTemplateId) {
    $.post(`/Vehicle/ConvertPlanRecordTemplateToPlanRecord?planRecordTemplateId=${planRecordTemplateId}`, function (data) {
        if (data.success) {
            var vehicleId = GetVehicleId().vehicleId;
            successToast(data.message);
            hidePlanRecordTemplatesModal();
            saveScrollPosition();
            getVehiclePlanRecords(vehicleId);
        } else {
            if (data.message == "Insufficient Supplies") {
                data.message += `<br /><br /><a class='text-link' style='cursor:pointer;' onclick='orderPlanSupplies(${planRecordTemplateId}, true)'>Order Required Supplies</a>`
            }
            errorToast(data.message);
        }
    });
}

function deletePlannerRecordTemplate(planRecordTemplateId) {
    $("#workAroundInput").show();
    Swal.fire({
        title: "Confirm Deletion?",
        text: "Deleted Plan Templates cannot be restored.",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#dc3545"
    }).then((result) => {
        if (result.isConfirmed) {
            $.post(`/Vehicle/DeletePlanRecordTemplateById?planRecordTemplateId=${planRecordTemplateId}`, function (data) {
                $("#workAroundInput").hide();
                if (data) {
                    successToast("Plan Template Deleted");
                    hideAddPlanRecordModal();
                } else {
                    errorToast(genericErrorMessage());
                }
            });
        } else {
            $("#workAroundInput").hide();
        }
    });
}
function savePlanRecordTemplate(isEdit) {
    //get values
    var formValues = getAndValidatePlanRecordValues();
    //validate
    if (formValues.hasError) {
        errorToast("Please check the form data");
        return;
    }
    //save to db.
    $.post('/Vehicle/SavePlanRecordTemplateToVehicleId', { planRecord: formValues }, function (data) {
        if (data.success) {
            if (isEdit) {
                hideAddPlanRecordModal();
                showPlanRecordTemplatesModal();
                $('[data-changed=true]').attr('data-changed', false)
                successToast('Plan Template Updated');
            } else {
                successToast('Plan Template Added');
            }
        } else {
            errorToast(data.message);
        }
    })
}
function getAndValidatePlanRecordValues() {
    var planDescription = $("#planRecordDescription").val();
    var planCost = $("#planRecordCost").val();
    var planNotes = $("#planRecordNotes").val();
    var planType = $("#planRecordType").val();
    var planPriority = $("#planRecordPriority").val();
    var planProgress = $("#planRecordProgress").val();
    var planDateCreated = getPlanRecordModelData().dateCreated;
    var vehicleId = GetVehicleId().vehicleId;
    var planRecordId = getPlanRecordModelData().id;
    var reminderRecordId = getPlanRecordModelData().reminderRecordId;
    //validation
    var hasError = false;
    var extraFields = getAndValidateExtraFields();
    if (extraFields.hasError) {
        hasError = true;
    }
    if (planDescription.trim() == '') {
        hasError = true;
        $("#planRecordDescription").addClass("is-invalid");
    } else {
        $("#planRecordDescription").removeClass("is-invalid");
    }
    if (planCost.trim() == '' || !isValidMoney(planCost)) {
        hasError = true;
        $("#planRecordCost").addClass("is-invalid");
    } else {
        $("#planRecordCost").removeClass("is-invalid");
    }
    return {
        id: planRecordId,
        hasError: hasError,
        vehicleId: vehicleId,
        dateCreated: planDateCreated,
        description: planDescription,
        cost: planCost,
        notes: planNotes,
        files: uploadedFiles,
        supplies: selectedSupplies,
        priority: planPriority,
        progress: planProgress,
        importMode: planType,
        extraFields: extraFields.extraFields,
        requisitionHistory: supplyUsageHistory,
        deletedRequisitionHistory: deletedSupplyUsageHistory,
        reminderRecordId: reminderRecordId,
        copySuppliesAttachment: copySuppliesAttachments
    }
}
//drag and drop stuff.

let dragged = null;
let draggedId = 0;
function dragEnter(event) {
    event.preventDefault();
}
function dragStart(event, planRecordId) {
    dragged = event.target;
    draggedId = planRecordId;
    event.dataTransfer.setData('text/plain', draggedId);
}
function dragOver(event) {
    event.preventDefault();
    if (planTouchTimer) {
        clearTimeout(planTouchTimer);
        planTouchTimer = null;
    }
}
function dropBox(event, newProgress) {
    var targetSwimLane = $(event.target).hasClass("swimlane") ? event.target : $(event.target).parents(".swimlane")[0];
    var draggedSwimLane = $(dragged).parents(".swimlane")[0];
    if (targetSwimLane != draggedSwimLane) {
        updatePlanRecordProgress(newProgress);
    }
    event.preventDefault();
}
function updatePlanRecordProgress(newProgress) {
    if (draggedId > 0) {
        if (newProgress == 'Done') {
            //if user is marking the task as done, we will want them to enter the mileage so that we can auto-convert it.
            Swal.fire({
                title: 'Mark Task as Done?',
                html: `<p>To confirm, please enter the current odometer reading on your vehicle, as we also need the current odometer to auto convert the task into the relevant record.</p>
                            <input type="text" inputmode="numeric" id="inputOdometer" class="swal2-input" placeholder="Odometer Reading" onkeydown="handleSwalEnter(event)">
                            `,
                confirmButtonText: 'Confirm',
                showCancelButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    var odometer = $("#inputOdometer").val();
                    if (odometer.trim() == '' && GetVehicleId().odometerOptional) {
                        odometer = '0';
                    }
                    if (!odometer || isNaN(odometer)) {
                        Swal.showValidationMessage(`Please enter an odometer reading`)
                    }
                    return { odometer }
                },
            }).then(function (result) {
                if (result.isConfirmed) {
                    //Odometer Adjustments
                    var adjustedOdometer = GetAdjustedOdometer(0, result.value.odometer);
                    $.post('/Vehicle/UpdatePlanRecordProgress', { planRecordId: draggedId, planProgress: newProgress, odometer: adjustedOdometer }, function (data) {
                        if (data) {
                            successToast("Plan Progress Updated");
                            var vehicleId = GetVehicleId().vehicleId;
                            getVehiclePlanRecords(vehicleId);
                        } else {
                            errorToast(genericErrorMessage());
                        }
                    });
                }
                draggedId = 0;
            });
        } else {
            $.post('/Vehicle/UpdatePlanRecordProgress', { planRecordId: draggedId, planProgress: newProgress }, function (data) {
                if (data) {
                    successToast("Plan Progress Updated");
                    var vehicleId = GetVehicleId().vehicleId;
                    getVehiclePlanRecords(vehicleId);
                } else {
                    errorToast(genericErrorMessage());
                }
            });
            draggedId = 0;
        }
    }
}
function orderPlanSupplies(planRecordTemplateId, closeSwal) {
    if (closeSwal) {
        Swal.close();
    }
    $.get(`/Vehicle/OrderPlanSupplies?planRecordTemplateId=${planRecordTemplateId}`, function (data) {
        if (data.success != undefined && !data.success) {
            //success is provided.
            errorToast(data.message);
        } else {
            //hide plan record template modal.
            hidePlanRecordTemplatesModal();
            $("#planRecordTemplateSupplyOrderModalContent").html(data);
            $("#planRecordTemplateSupplyOrderModal").modal('show');
        }
    })
}
function hideOrderSupplyModal() {
    $("#planRecordTemplateSupplyOrderModal").modal('hide');
    showPlanRecordTemplatesModal();
}
function configurePlanTableContextMenu(planRecordId, currentSwimLane) {
    //clear any bound actions
    $(".context-menu-move").off('click');
    //bind context menu actions
    $(".context-menu-delete").on('click', () => {
        deletePlanRecord(planRecordId, true);
    });
    let planRecordIdArray = [planRecordId];
    $(".context-menu-print-tab-sticker").on('click', () => {
        printTabStickers(planRecordIdArray, 'PlanRecord');
    });
    $(".context-menu-duplicate").on('click', () => {
        duplicateRecords(planRecordIdArray, 'PlanRecord');
    });
    $(".context-menu-duplicate-vehicle").on('click', () => {
        duplicateRecordsToOtherVehicles(planRecordIdArray, 'PlanRecord');
    });
    $(".context-menu-move.move-planned").on('click', () => {
        draggedId = planRecordId;
        updatePlanRecordProgress('Backlog');
        draggedId = 0;
    });
    $(".context-menu-move.move-doing").on('click', () => {
        draggedId = planRecordId;
        updatePlanRecordProgress('InProgress');
    });
    $(".context-menu-move.move-testing").on('click', () => {
        draggedId = planRecordId;
        updatePlanRecordProgress('Testing');
    });
    $(".context-menu-move.move-done").on('click', () => {
        draggedId = planRecordId;
        updatePlanRecordProgress('Done');
    });
    //hide all move buttons
    $(".context-menu-move").hide();
    $(".context-menu-delete").show(); //delete is always visible.
    switch (currentSwimLane) {
        case 'Backlog':
            $(".context-menu-move.move-header").show();
            $(".context-menu-move.move-doing").show();
            $(".context-menu-move.move-testing").show();
            $(".context-menu-move.move-done").show();
            break;
        case 'InProgress':
            $(".context-menu-move.move-header").show();
            $(".context-menu-move.move-planned").show();
            $(".context-menu-move.move-testing").show();
            $(".context-menu-move.move-done").show();
            break;
        case 'Testing':
            $(".context-menu-move.move-header").show();
            $(".context-menu-move.move-planned").show();
            $(".context-menu-move.move-doing").show();
            $(".context-menu-move.move-done").show();
            break;
        case 'Done':
            break;
    }
}
function showPlanTableContextMenu(e, planRecordId, currentSwimLane) {
    if (event != undefined) {
        event.preventDefault();
    }
    if (getDeviceIsTouchOnly()) {
        return;
    }
    if (planRecordId == 0) {
        return;
    }
    $(".table-context-menu").fadeIn("fast");
    $(".table-context-menu").css({
        left: getMenuPosition(event.clientX, 'width', 'scrollLeft'),
        top: getMenuPosition(event.clientY, 'height', 'scrollTop')
    });
    configurePlanTableContextMenu(planRecordId, currentSwimLane);
}
function showPlanTableContextMenuForMobile(e, xPosition, yPosition, planRecordId, currentSwimLane) {
    $(".table-context-menu").fadeIn("fast");
    $(".table-context-menu").css({
        left: getMenuPosition(xPosition, 'width', 'scrollLeft'),
        top: getMenuPosition(yPosition, 'height', 'scrollTop')
    });
    configurePlanTableContextMenu(planRecordId, currentSwimLane);
    if (planTouchTimer) {
        clearTimeout(planTouchTimer);
        planTouchTimer = null;
    }
}
var planTouchTimer;
var planTouchDuration = 3000;
function detectPlanItemLongTouch(sender, planRecordId, currentSwimLane) {
    var touchX = event.touches[0].clientX;
    var touchY = event.touches[0].clientY;
    if (!planTouchTimer) {
        planTouchTimer = setTimeout(function () { showPlanTableContextMenuForMobile(sender, touchX, touchY, planRecordId, currentSwimLane); detectPlanItemTouchEndPremature(sender); }, planTouchDuration);
    }
}
function detectPlanItemTouchEndPremature(sender) {
    if (planTouchTimer) {
        clearTimeout(planTouchTimer);
        planTouchTimer = null;
    }
}