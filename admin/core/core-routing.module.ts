import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class CoreRoutingModule {

    constructor(
        private router: Router
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scroll(0, 0);
            }
        });
    }
}
