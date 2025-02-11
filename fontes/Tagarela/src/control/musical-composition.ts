import { MusicalComposition, MusicalCompositionOption, MusicalCompositionLine } from '../model/musical-composition';
import { MusicalCompositionConfig, MusicalCompositionOptionConfig } from '../model/musical-composition-config';
import { MusicalCompositionSource, MusicalCompositionOptionSource } from '../model/musical-composition-source';
import { Midi} from '../model/midi';
import { MidiControl } from './midi';
import { MidiSpectrum, CompositionMidiSpectrumsData } from '../model/midi-spectrum';

export class MusicalCompositionControl {

    private _config: MusicalCompositionConfig;
    private _source: MusicalCompositionSource;
    private _composition: MusicalComposition;
    private _midiControl: MidiControl;
    private _options: MusicalCompositionOption[][][];
    private _stepIndex: number;
    private _lineIndex: number;

    constructor(config: MusicalCompositionConfig, source: MusicalCompositionSource) {
        this.midiControl = new MidiControl();
        this.composition = new MusicalComposition();
        this.config = config;
        this.source = source;

        this.setupDefaultValues();
        this.populateOptionsMap();

    }

    get config(): MusicalCompositionConfig {
        return this._config;
    }
    
    set config(config: MusicalCompositionConfig) {
        this._config = config;
    }
    
    get source(): MusicalCompositionSource {
        return this._source;
    }
    
    set source(source: MusicalCompositionSource) {
        this._source = source;
    }

    get composition(): MusicalComposition {
        return this._composition;
    }
    
    set composition(composition: MusicalComposition) {
        this._composition = composition;
    }

    get midiControl(): MidiControl {
        return this._midiControl;
    }
    
    set midiControl(midiControl: MidiControl) {
        this._midiControl = midiControl;
    }

    get options(): MusicalCompositionOption[][][] {
        return this._options;
    }
    
    set options(options: MusicalCompositionOption[][][]) {
        this._options = options;
    }

    get stepIndex(): number {
        return this._stepIndex;
    }
    
    set stepIndex(stepIndex:number) {
        this._stepIndex = stepIndex;
    }
    
    get lineIndex(): number {
        return this._lineIndex;
    }
    
    set lineIndex(lineIndex:number) {
        this._lineIndex = lineIndex;
    }

    private setupDefaultValues(): void {
        if (!this.config)
            throw new Error('O objeto de configuração não pode ser nulo.');

        //indexes
        this.stepIndex = 0;
        this.lineIndex = 0;

        this.composition.numerator = this.config.numerator;
        this.composition.denominator = this.config.denominator;
        this.composition.timeDivisionMetric = this.config.timeDivisionMetric; 
        this.composition.mode = this.config.mode;
        this.composition.keySignaturesAllowed = this.config.keySignaturesAllowed;
        this.composition.keySignature = this.config.keySignature;
        this.composition.showCompositionData = this.config.showCompositionData;

        //tempo
        this.composition.minTempo = this.config.minTempo;
        this.composition.maxTempo = this.config.maxTempo;
        this.composition.stepTempo = this.config.stepTempo;
        this.composition.tempo = this.config.defaultTempo;

        let newLine: MusicalCompositionLine;

        //lines
        for(let line of this.config.linesConfig){
            newLine = new MusicalCompositionLine();
            newLine.name = line.name;
            newLine.minVolume = line.minVolume;
            newLine.maxVolume = line.maxVolume;
            newLine.stepVolume = line.stepVolume;
            newLine.volume = line.defaultVolume;
            this.composition.lines.push(newLine);
        }
    }

    private populateOptionsMap(): void {
        if (!this.config)
            throw new Error('O objeto de configuração não pode ser nulo.');
        
        this.options = [];

        let steps: MusicalCompositionOption[][][] = [];
        let lines: MusicalCompositionOption[][];
        let options: MusicalCompositionOption[];

        for(let i = 0; i < this.config.stepsConfig.length; i++){
            lines = [];
            for(let j = 0; j < this.config.stepsConfig[i].linesConfig.length; j++) {
                options = this.generateOptionsToChoice(i, j);
                lines.push(options);
            }
            steps.push(lines);
        }
        this.options = steps;
    }
    
    private generateOptionsToChoice(stepIndex: number, lineIndex: number): MusicalCompositionOption[] {
        let options: MusicalCompositionOption[] = []
        
        let optionConfig: MusicalCompositionOptionConfig;
        let optionSource: MusicalCompositionOptionSource;
        let newOption: MusicalCompositionOption;

        for (let i = 0; i < this.source.stepsSource[stepIndex].linesSource[lineIndex].optionsSource.length; i++) {
            optionConfig = this.config.stepsConfig[stepIndex].linesConfig[lineIndex].optionsConfig[i];
            optionSource = this.source.stepsSource[stepIndex].linesSource[lineIndex].optionsSource[i];
            newOption = new MusicalCompositionOption();
            newOption.fileName = optionConfig.fileName;
            newOption.musicalInstrument = optionConfig.defaultMusicalInstrument;
            newOption.musicalInstrumentsAllowed = optionConfig.musicalInstrumentsAllowed;
            newOption.midi = optionSource.midi; 
            this.midiControl.ajustMidiSize(newOption.midi, 0, this.config.stepsConfig[stepIndex].quantityOfQuarterNote * this.composition.timeDivisionMetric);
            newOption.spectrum = this.midiControl.generateMidiSpectrum(newOption.midi)
            options.push(newOption);
        }
        return options; 
    }

    public compositionHasStarted(): boolean {
        return this.stepIndex > 0 || this.lineIndex > 0;
    }

    public compositionHasEnded(): boolean {
        return this.stepIndex > this.source.stepsSource.length-1
    }

    public getOptionsToChoice(): MusicalCompositionOption[] {
        if (this.options.length > this.stepIndex && this.options[this.stepIndex].length > this.lineIndex) {
            return this.options[this.stepIndex][this.lineIndex];
        } 
        return [];
    }

    public applyOptionChanges(option: MusicalCompositionOption): void {
        this.applyOptionChangesInMidi(option);
        this.applyMidiNoteAndTempoChanges(option.midi);
    }

    public applyOptionChangesInMidi(option: MusicalCompositionOption): void {
        if (!option)
            throw new Error('A opção não pode ser nula.');

        option.midi.applyInstrumentChange(option.musicalInstrument);
    }
    
    public applyLineChanges(line: MusicalCompositionLine): void {
        this.applyLineChangesInMidi(line);
        this.applyMidiNoteAndTempoChanges(line.midi);
    }

    public applyLineChangesInMidi(line: MusicalCompositionLine): void {
        if (!line)
            throw new Error('A linha não pode ser nula.');
        
        if (line.options.length > 0) {
            let midi: Midi;
            this.applyOptionChangesInMidi(line.options[0]);
            midi = line.options[0].midi.cloneMidi();
            for (let i = 1; i < line.options.length; i++) {
                this.applyOptionChangesInMidi(line.options[i]);
                midi = this.midiControl.concatenateMidisChannels(midi, line.options[i].midi);
            }        
            midi.applyVolumeChange(line.volume);
            line.midi = midi;
        } 
    }

    public applyGeneralChanges(): void {
        let midiLines: Midi[] = [];
        for (let line of this.composition.lines) {
            if (line.options.length > 0) {
                this.applyLineChangesInMidi(line);
                if (line.midi) {
                    this.applyMidiNoteAndTempoChanges(line.midi);
                    midiLines.push(line.midi);
                }
            }
        }
        this.composition.midi = this.midiControl.concatenateMidisInTracks(midiLines);
    }

    private applyMidiNoteAndTempoChanges(midi: Midi): void {
        if (!midi)
            throw new Error('O midi não pode ser nulo.');

        midi.applyNoteTranspose(this.composition.keySignature);
        midi.applyTempoChange(this.composition.getTempo());
    }

    public applyChoice(option: MusicalCompositionOption): void {
        if (!option)
            throw new Error('A opção não pode ser nula.');

        this.composition.lines[this.lineIndex].options.push(option);
        this.applyLineChangesInMidi(this.composition.lines[this.lineIndex]);
        this.lineIndex++;
        if (this.lineIndex >= this.composition.lines.length) {
            this.lineIndex = 0;
            this.stepIndex++;
        }
    }

    public undoChoice(): void {
        if (this.lineIndex > 0 || this.stepIndex > 0) {
            this.lineIndex--;
            if (this.lineIndex < 0) {
                this.lineIndex = this.composition.lines.length -1;
                this.stepIndex--;
            }
            this.composition.lines[this.lineIndex].options.pop();
        }
    }

    public getCompositionMidiSpectrums(compositionLine?: MusicalCompositionLine): CompositionMidiSpectrumsData {

        let spectrums: MidiSpectrum[][] = [];
        let musicalInstruments: number[][] = [];
        let minNotes: number[] = [];
        let maxNotes: number[] = [];
    
        let lineSpectrums: MidiSpectrum[]; 
        let lineMusicalInstruments: number[];

        for (let line of (!compositionLine ? this.composition.lines : [compositionLine])) {
            if (line.options.length > 0) {
                lineSpectrums = []; 
                lineMusicalInstruments = [];
                for (let option of line.options) {
                    lineSpectrums.push(option.spectrum);
                    lineMusicalInstruments.push(option.musicalInstrument);
                }
                minNotes.push(line.getMinNote())
                maxNotes.push(line.getMaxNote())
                spectrums.push(lineSpectrums);
                musicalInstruments.push(lineMusicalInstruments);
            }
        }
        return new CompositionMidiSpectrumsData(spectrums, musicalInstruments, minNotes, maxNotes);

    }

}
