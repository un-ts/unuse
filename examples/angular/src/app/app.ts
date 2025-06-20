import type { OnInit, WritableSignal } from '@angular/core';
import {
  Component,
  EnvironmentInjector,
  inject,
  isSignal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import type { UnSignal } from '@unuse/angular';
import { unResolve, unSignal, useIntervalFn } from '@unuse/angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  #injector = inject(EnvironmentInjector);

  signal: UnSignal<string> = unSignal<string>('Hello, World!');

  resolvedAngularSignal: WritableSignal<string> = unResolve(this.signal, {
    AngularEnvironmentInjector: this.#injector as any,
  }) as unknown as WritableSignal<string>;

  isAngularSignal: boolean = isSignal(this.resolvedAngularSignal);

  interval = useIntervalFn(
    () => {
      console.log('Interval function executed', this.interval.isActive());
    },
    1000,
    {
      AngularEnvironmentInjector: this.#injector as any,
    }
  );

  ngOnInit(): void {
    console.log(this.resolvedAngularSignal);

    console.log('Resolved Angular Signal:', this.resolvedAngularSignal());
  }
}
