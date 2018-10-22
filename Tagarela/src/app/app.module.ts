import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { Tagarela } from './app.component';
import { CompositionPage } from '../pages/composition/composition';
import { GeneralControlComponent } from '../components/general-control/general-control';
import { CompositionControlComponent } from '../components/composition-control/composition-control';
import { ChoiceComponent } from '../components/choice/choice';
import { DragComponentDirective } from '../directives/drag-component/drag-component';

import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Media } from '@ionic-native/media';
import { SetupCompositionSourcePage } from '../pages/setup-composition-source/setup-composition-source';
import { ChoiceCompositionSourcePage } from '../pages/choice-composition-source/choice-composition-source';
import { SlidePopoverComponent } from '../components/slide-popover/slide-popover';
import { ListPopoverComponent } from '../components/list-popover/list-popover';
import { PlayMidiComponent } from '../components/play-midi/play-midi';
import { FileProvider } from '../providers/file/file';
import { MediaProvider } from '../providers/media/media';
import { VisualMidiProvider } from '../providers/visual-midi/visual-midi';
import { MidiSpectrumSvgProvider } from '../providers/midi-spectrum-svg/midi-spectrum-svg';
import { LineControl } from '../components/line-control/line-control';

@NgModule({
  declarations: [
    Tagarela,
    ChoiceCompositionSourcePage,
    SetupCompositionSourcePage,
    CompositionPage, 
    GeneralControlComponent,
    CompositionControlComponent,
    ChoiceComponent, 
    LineControl,
    SlidePopoverComponent,
    ListPopoverComponent,
    PlayMidiComponent,
    DragComponentDirective
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(Tagarela)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Tagarela,
    CompositionPage,
    SetupCompositionSourcePage,
    ChoiceCompositionSourcePage,
    SlidePopoverComponent,
    ListPopoverComponent,
    PlayMidiComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    FilePath,
    Media,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FileProvider,
    MediaProvider,
    VisualMidiProvider,
    MidiSpectrumSvgProvider
  ]
})
export class AppModule {}
