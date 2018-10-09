import { File } from '@ionic-native/file';
import { FileUtil } from "./file";
import { Midi, MidiConstants } from './midi';
import { v4 as uuid } from 'uuid';
import { MidiMusicalInstrument } from './midi-models';

export class MusicalCompositionSource {

    private fileUtil: FileUtil;
    private _rootStep: MusicalCompositionStep;

    get rootStep(): MusicalCompositionStep {
        return this._rootStep;
    }

    set rootStep(rootStep: MusicalCompositionStep) {
        this._rootStep = rootStep;
    }

    constructor(file: File){
        this.fileUtil = new FileUtil(file);
    }

    public async buildSource(devicePath: string, relativePath: string) {
        try {
            this.rootStep = null;
            let stepDirectoriesList: string[] = await this.fileUtil.getListOfDirectories(devicePath, relativePath);
            let lastCompositionStep: MusicalCompositionStep;
            //steps
            for (let stepDirectory of stepDirectoriesList) {
                let musicalCompositionStep = new MusicalCompositionStep();
                musicalCompositionStep.name = stepDirectory;     
                let stepPath: string = this.fileUtil.concatenatePath(relativePath, stepDirectory);
                let lineDirectoriesList: string[] = await this.fileUtil.getListOfDirectories(devicePath, stepPath);
                //lines
                for (let lineDirectory of lineDirectoriesList) {
                    let musicalCompositionLine = new MusicalCompositionLine();
                    musicalCompositionLine.name = lineDirectory;
                    let linePath: string = this.fileUtil.concatenatePath(stepPath, lineDirectory);
                    let optionDirectoriesList: string[] = await this.fileUtil.getListOfFiles(devicePath, linePath)
                    //options
                    for (let optionFile of optionDirectoriesList) {
                        let musicalCompositionOption = new MusicalCompositionOption();
                        musicalCompositionOption.name = optionFile;
                        let fullOptionPath: string = this.fileUtil.concatenatePath(devicePath, linePath);
                        musicalCompositionOption.midiFile = await this.fileUtil.readFileAsBinaryString(fullOptionPath, optionFile);
                        musicalCompositionOption.setupMidi();
                        musicalCompositionLine.addCompositionOption(musicalCompositionOption);
                    }
                    musicalCompositionStep.addCompositionLine(musicalCompositionLine);
                }
                if (this.rootStep) {
                    lastCompositionStep.nextStep = musicalCompositionStep;
                } else {
                    this.rootStep = musicalCompositionStep;
                }
                lastCompositionStep = musicalCompositionStep;
            }

            /*
            let teste:MusicalCompositionStep = this.rootStep;
            while (teste){
                alert(teste.name)
                for (let a of teste._musicalCompositionLine){
                    alert(a.name)
                    for (let b of a._musicalCompositionOption){
                        alert(b.name)
                    }
                }
                teste = teste.nextStep
            }
            */

        } catch (e) {
            console.log(e)
        }
    }

}

export class MusicalCompositionStep {
    
    private _name: string
    private _musicalCompositionLine: MusicalCompositionLine[];
    private _nextStep: MusicalCompositionStep;

    constructor() {
        this._musicalCompositionLine = [];
    }
    
    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }
    
    get musicalCompositionLine(): MusicalCompositionLine[] {
        return this._musicalCompositionLine;
    }

    set musicalCompositionLine(musicalCompositionLine: MusicalCompositionLine[]) {
        this._musicalCompositionLine = musicalCompositionLine;
    }

    get nextStep(): MusicalCompositionStep {
        return this._nextStep;
    }

    set nextStep(nextStep: MusicalCompositionStep) {
        this._nextStep = nextStep;
    }

    public addCompositionLine(musicalCompositionLine: MusicalCompositionLine){
        this.musicalCompositionLine.push(musicalCompositionLine);
    }

}

export class MusicalCompositionLine {
    
    private _name: string
    private _musicalCompositionOption: MusicalCompositionOption[];

    constructor() {
        this.musicalCompositionOption = [];
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get musicalCompositionOption(): MusicalCompositionOption[] {
        return this._musicalCompositionOption;
    }

    set musicalCompositionOption(musicalCompositionOption: MusicalCompositionOption[]) {
        this._musicalCompositionOption = musicalCompositionOption;
    }

    public addCompositionOption(musicalCompositionOption: MusicalCompositionOption){
        this.musicalCompositionOption.push(musicalCompositionOption);
    }

}

export class MusicalCompositionOption {

    private _uId: string;
    private _name: string;
    private _midiFile: string;
    private _midi: Midi;
    public midiCompositionOptions: MidiCompositionOptions;

    constructor() {
        this.uId = uuid();
        this.midiCompositionOptions = new MidiCompositionOptions();
    }

    get uId(): string {
        return this._uId;
    }

    set uId(uId: string) {
        this._uId = uId;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get midiFile(): string {
        return this._midiFile;
    }

    set midiFile(midiFile: string) {
        this._midiFile = midiFile;
    }

    get midi(): Midi {
        return this._midi;
    }

    set midi(midi: Midi) {
        this._midi = midi;
    }

    setupMidi(){
        this.midi = new Midi();
        this.midi.setupMidiFromFile(this.midiFile);
    }

}

export class Composition {

    private _musicalCompositionSource: MusicalCompositionSource;
    private _compositionLines: CompositionLine[];
    private _actualStep: MusicalCompositionStep;
    private _compositionLineIndex: number;
    public midiId: string;
    public midi: Midi;
    public compositionOptions: CompositionOptions;

    constructor(musicalCompositionSource: MusicalCompositionSource) {
        this._musicalCompositionSource = musicalCompositionSource;
        this.compositionLines = [];
        this.actualStep = musicalCompositionSource.rootStep;
        this.compositionLineIndex = 0;
        this.midiId = uuid();
        this.compositionOptions = new CompositionOptions();
    }

    public applyChoice(choice: MusicalCompositionOption) {
        if (this.compositionLines.length <= this.compositionLineIndex) {
            this.addCompositionLine(this.actualStep.musicalCompositionLine[this.compositionLineIndex].name);
        }
        this.compositionLines[this.compositionLineIndex].addCompositionOption(choice);
        this.compositionLineIndex++;
        if (this.actualStep.musicalCompositionLine.length <= this.compositionLineIndex) {
            this.compositionLineIndex = 0;
            this.actualStep = this.actualStep.nextStep;
        } 
    }

    get compositionLines(): CompositionLine[] {
        return this._compositionLines;
    }

    set compositionLines(compositionLines: CompositionLine[]) {
        this._compositionLines = compositionLines;
    }

    public addCompositionLine(name: string){
        this.compositionLines.push(new CompositionLine(name));
    }

    public addCompositionOption(compositionIndex: number, musicalCompositionOption: MusicalCompositionOption){
        this.compositionLines[compositionIndex].addCompositionOption(musicalCompositionOption);
    }

    get actualStep(): MusicalCompositionStep {
        return this._actualStep;
    }

    set actualStep(actualStep: MusicalCompositionStep) {
        this._actualStep = actualStep;
    }

    get compositionLineIndex(): number {
        return this._compositionLineIndex;
    }

    set compositionLineIndex(compositionLineIndex: number) {
        this._compositionLineIndex = compositionLineIndex;
    }

    public generateGeneralMidi() {
        this.midi = new Midi();
        let midiLines: Midi[] = [];
        for (let compositionLine of this.compositionLines) {
            compositionLine.generateLineMidi();
            midiLines.push(compositionLine.lineMidi);
        }
        this.midi.generateMidiType1(midiLines);
    }


    public getSignatureKey(): number {
        return this.compositionOptions.getkeySignatureValue();
    }

    public getTempo(): number {
        return this.compositionOptions.getTempoValue();
    }

 }

export class CompositionOptions {

    //FF59
    public keySignatureIndex: number;
    private toneConversionFactor: number[];
    
    //FF51
    public tempo: number;

    constructor () {
        this.keySignatureIndex = 0;
        this.tempo = 120;
    }

    public getTempoValue(): number {
        //Tempo in microseconds per quarter note
        return  Math.round(60000000 / this.tempo)
    }

    public getkeySignatureValue(): number{
        return MidiConstants.KEY_SIGNATURE_CONVERSION_VECTOR[this.keySignatureIndex];
    }

}

export class CompositionMidiOptions {
    public musicalInstrument: MidiMusicalInstrument;

    constructor(midiInstrumentNumber: number) {
        this.musicalInstrument = new MidiMusicalInstrument(midiInstrumentNumber);
    }

}

export class MidiCompositionOptions {
    public musicalInstrumentNumber: number = 0;
}

export class LineCompositionOptions {
    public volume: number = 64;

    volumeDown(){
        if (this.volume > 0) {
            this.volume--;
        }
    }

    volumeUp(){
        if (this.volume < 127) {
            this.volume++;
        }
    }
}



export class CompositionLine {
    
    public name: string;
    private _compositionOptions: MusicalCompositionOption[];
    public lineMidiId: string;
    public lineMidi: Midi;
    public lineCompositionOptions: LineCompositionOptions;
    

    constructor(name: string) {
        this.name = name;
        this.compositionOptions = [];
        this.lineMidiId = uuid();
        this.lineCompositionOptions = new LineCompositionOptions();
    }

    get compositionOptions(): MusicalCompositionOption[] {
        return this._compositionOptions;
    }

    set compositionOptions(compositionOptions: MusicalCompositionOption[]) {
        this._compositionOptions = compositionOptions;
    }

    public generateLineMidi() {
        if (this.compositionOptions.length > 0) {
            this.compositionOptions[0].midi.applyInstrumentChange(this.compositionOptions[0].midiCompositionOptions.musicalInstrumentNumber);
            this.lineMidi = this.compositionOptions[0].midi.cloneMidi();
        }
        for (let i = 1; i < this.compositionOptions.length; i++) {
            this.compositionOptions[i].midi.applyInstrumentChange(this.compositionOptions[i].midiCompositionOptions.musicalInstrumentNumber);
            this.lineMidi.concatenateMidi(this.compositionOptions[i].midi);
        }        
        this.lineMidi.applyVolumeChange(this.lineCompositionOptions.volume);
    }

    public addCompositionOption(musicalCompositionOption: MusicalCompositionOption){
        this.compositionOptions.push(musicalCompositionOption);
    }

}