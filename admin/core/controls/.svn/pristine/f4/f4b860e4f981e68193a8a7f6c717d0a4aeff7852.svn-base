import { Component, OnInit, ViewChild, ElementRef,NgModule, ViewEncapsulation, Input, Output, Injector  } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { WebcamInitError, WebcamImage, WebcamUtil } from 'ngx-webcam';
import { AppInfoDialogComponent } from "../app-info-dialog/app-info-dialog.component";
import { FormatsDialogComponent } from "../formats-dialog/formats-dialog.component";
import { FormGroup } from "@angular/forms";
import { createCustomInputControlValueAccessor, ControlComponent } from '../../control.component';

@Component({
    selector: "code-scanner",
    templateUrl: "./code-scanner.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [createCustomInputControlValueAccessor(CodeScannerComponent)]
})

export class CodeScannerComponent extends ControlComponent implements OnInit {

    _ngModel: string;

    public get ngModel(): any {
        return this._ngModel;
    }

    @Input() @Output() public set ngModel(value) {
        this._ngModel = value;
    }

    @Input() inpCss: string;

    constructor(
        injector: Injector,
        private readonly _dialog: MatDialog
    ) {
        super(injector)
    }

  //Take photo
  isHide=false;
  showCam(){
    this.isHide=true;
    this.hasDevices=false;
  }
   //  webcam on/off
   public showWebcam = true;
   public allowCameraSwitch = true;
   public multipleWebcamsAvailable = false;
   public deviceId: string;
   public videoOptions: MediaTrackConstraints = {
   };
   public errors: WebcamInitError[] = [];
 
   public webcamImage: WebcamImage = null;
 
   // webcam snapshot trigger
   private trigger: Subject<void> = new Subject<void>();
   // switch to next / previous / specific webcam; true/false: forward/backwards
   private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
 
   public ngOnInit(): void {
     WebcamUtil.getAvailableVideoInputs()
       .then((mediaDevices: MediaDeviceInfo[]) => {
         this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
       });
   }
 
   public triggerSnapshot(): void {
     this.trigger.next();
   }
 
   public handleInitError(error: WebcamInitError): void {
     this.errors.push(error);
   }
 
   public showNextWebcam(directionOrDeviceId: boolean|string): void {
     this.nextWebcam.next(directionOrDeviceId);
   }
 
   public handleImage(webcamImage: WebcamImage): void {
     this.webcamImage = webcamImage;
   }
 
   public cameraWasSwitched(deviceId: string): void {
     this.deviceId = deviceId;
   }
 
   public get triggerObservable(): Observable<void> {
     return this.trigger.asObservable();
   }
 
   public get nextWebcamObservable(): Observable<boolean|string> {
     return this.nextWebcam.asObservable();
   }

////scanner
  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  hasDevices: boolean;
  hasPermission: boolean;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  showDevices(){
    this.hasDevices=true;
    this.isHide=false;
  }
  clearResult(): void {
    this._ngModel = null;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onCodeResult(resultString: string) {
    this._ngModel = resultString;
    this.onChangeCallback(resultString);
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
  }

  openFormatsDialog() {
    const data = {
      formatsEnabled: this.formatsEnabled,
    };

    this._dialog
      .open(FormatsDialogComponent, { data })
      .afterClosed()
      .subscribe(x => { if (x) { this.formatsEnabled = x; } });
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  openInfoDialog() {
    const data = {
      hasDevices: this.hasDevices,
      hasPermission: this.hasPermission,
    };

    this._dialog.open(AppInfoDialogComponent, { data });
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }

}