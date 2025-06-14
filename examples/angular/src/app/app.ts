import type { OnInit, WritableSignal } from '@angular/core';
import { Component, isSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import type { UnSignal } from 'unuse-angular';
import { unResolve, unSignal, useIntervalFn } from 'unuse-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  signal!: UnSignal<string>;

  resolvedAngularSignal!: WritableSignal<string>;

  isAngularSignal!: boolean;

  ngOnInit(): void {
    this.signal = unSignal<string>('Hello, World!');

    this.resolvedAngularSignal = unResolve(
      this.signal
    ) as unknown as WritableSignal<string>;

    console.log(this.resolvedAngularSignal);

    this.isAngularSignal = isSignal(this.resolvedAngularSignal);

    console.log('Resolved Angular Signal:', this.resolvedAngularSignal());

    const { isActive } = useIntervalFn(() => {
      console.log('Interval function executed', isActive);
    }, 1000);
  }
}
