import { Component, Input } from '@angular/core';
import { MusicalCompositionControl } from '../../control/musical-composition';
import { PopoverController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { ListPopoverComponent } from '../list-popover/list-popover';
import { SlidePopoverComponent } from '../slide-popover/slide-popover';
import { PlayMidiComponent } from '../play-midi/play-midi';
import { VisualMidiProvider } from '../../providers/visual-midi/visual-midi';
import { GenericComponent } from '../../control/generic-component';
import { MidiSpectrum } from '../../model/midi-spectrum';
import { MidiSpectrumSvgProvider } from '../../providers/midi-spectrum-svg/midi-spectrum-svg';
import { DownloadMidiComponent } from '../download-midi/download-midi';

@Component({
    selector: 'general-control',
    templateUrl: 'general-control.html'
})
export class GeneralControlComponent extends GenericComponent {
    
    private _compositionControl: MusicalCompositionControl;

    constructor(private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private popoverCtrl: PopoverController,
                private visualMidiProvider: VisualMidiProvider,
                private midiSpectrumSvgProvider: MidiSpectrumSvgProvider,
                private toastCtrl: ToastController) {

        super(loadingCtrl,
              alertCtrl,
              popoverCtrl,
              toastCtrl);

    }
   
    get compositionControl(): MusicalCompositionControl {
        return this._compositionControl;
    }

    @Input() 
    set compositionControl(compositionControl: MusicalCompositionControl) {
        this._compositionControl = compositionControl;
    }

    private playMidi() {
        try {
            this.compositionControl.applyGeneralChanges();
            this.startPopover(
                PlayMidiComponent, 
                {
                    spectrum: this.getSVGMidiSpectrum(),
                    midi: this.compositionControl.composition.midi,
                    midiId: this.compositionControl.composition.midiId
                },
                {   
                    cssClass: 'custom-popover',
                    enableBackdropDismiss: false
                }
            );
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private getSVGMidiSpectrum(): string {
        let spectrums: MidiSpectrum[][] = [];
        let musicalInstruments: number[][] = [];
        let minNotes: number[] = [];
        let maxNotes: number[] = [];
    
        for (let line of this.compositionControl.composition.lines) {

            let lineSpectrums: MidiSpectrum[] = []; 
            let lineMusicalInstruments: number[] = [];

            for (let option of line.options) {
                lineSpectrums.push(option.spectrum);
                lineMusicalInstruments.push(option.musicalInstrument);
            }

            minNotes.push(line.getMinSpectrumNote())
            maxNotes.push(line.getMaxSpectrumNote())
            spectrums.push(lineSpectrums);
            musicalInstruments.push(lineMusicalInstruments);

        }
        return this.midiSpectrumSvgProvider.concatenateSpectrums(spectrums, musicalInstruments, this.compositionControl.composition.midi.getTimeDivisionMetric(), minNotes, maxNotes);
    }

    private changeKeySignature(){
        try {
            this.startPopover(
                ListPopoverComponent, 
                {
                    title: 'Armadura de Clave',
                    list: this.compositionControl.composition.keySignaturesAllowed,
                    callback: this.setKeySignature.bind(this),
                    iconFunction: this.visualMidiProvider.getIonIconToKeySignatureNumber,
                    nameFunction: this.getKeySignatureName(this.compositionControl.composition.mode)
                }
            );
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private getKeySignatureName(mode: number) {
        return (keySignatureNumber: number): string => {
            return this.visualMidiProvider.getKeySignatureName(keySignatureNumber, mode);
        }
    }

    private setKeySignature(keySignature: number) {
        try {
            this.compositionControl.composition.keySignature = keySignature;
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private changeTempo(){
        try {
            this.startPopover(
                SlidePopoverComponent, 
                {
                    callback: this.setTempo.bind(this),
                    color: 'danger',
                    description: 'Tempo',
                    value: this.compositionControl.composition.tempo,
                    minRangeValue: this.compositionControl.composition.minTempo,
                    maxRangeValue: this.compositionControl.composition.maxTempo,
                    stepRangeValue: this.compositionControl.composition.stepTempo,
                    snapsRange: false
                }
            );
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private setTempo(tempo: number) {
        try {
            this.compositionControl.composition.tempo = tempo;
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private undo() {
        try {
            this.compositionControl.undoChoice();
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private compositionHasStarted(): boolean{
        try {
            return this.compositionControl.compositionHasStarted();
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private compositionHasEnded(): boolean{
        try {
            return this.compositionControl.compositionHasEnded();
        } catch (e) {
            this.errorHandler(e)
        }
    }

    private async downloadComposition() {
        try {
            this.compositionControl.applyGeneralChanges();
            this.startPopover(
                DownloadMidiComponent,
                {
                    title: 'Baixar a Composição',
                    midi: this.compositionControl.composition.midi
                }
            )
        } catch (e) {
            this.errorHandler(e)
        }
    }

}
