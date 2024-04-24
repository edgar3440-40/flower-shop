import {Component, HostListener, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  searchField = new FormControl();
  showedSearch: boolean = false;
  products: ProductType[] = [];
  searchValue: string = '';
  isLogged: boolean = false;
  @Input() categories: CategoryWithTypeType[] = [];
  count: number = 0;
  serverStaticPath = environment.serverStaticPath;
  constructor(private authService: AuthService, private _snackBar: MatSnackBar,
              private router: Router, private cartService: CartService,
              private productService: ProductService,
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
    console.log(this.isLogged);

  }

  ngOnInit(): void {


    this.searchField.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(value => {
          if(value && value.length > 2) {
            console.log(value)
            this.productService.searchProducts(value)
              .subscribe((data: ProductType[]) => {
                this.products = data;
                this.showedSearch = true;
              });
          } else {
            this.products = [];
          }
      });

    this.cartService.getCartCount()
      .subscribe((data: {count: number} | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.count = (data as {count: number}).count;
      });


    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    })

    this.cartService.count$
      .subscribe(count => {
        this.count = count;
      })
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('You have successfully logged out');
    this.router.navigate(['/']);
  }

  // changedSearchValue(newValue: string) {
  //   this.searchValue = newValue;
  //
  //   if(this.searchValue && this.searchValue.length > 2) {
  //     this.productService.searchProducts(this.searchValue)
  //       .subscribe((data: ProductType[]) => {
  //         this.products = data;
  //         this.showedSearch = true;
  //       });
  //   } else {
  //     this.products = [];
  //   }
  // }

  selectProduct(url: string) {
    this.router.navigate(['/product/' + url]);
    // this.searchValue = '';
    this.searchField.setValue('');
    this.products = [];
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if(this.showedSearch && (event.target as HTMLElement).className.indexOf('search-product') === -1) {
      this.showedSearch = false;
    }
  }
  // first way to close popup by clicking on other part of the page
  // changeShowedSearch(value: boolean) {
  //
  //   setTimeout(() => {
  //     this.showedSearch = value;
  //
  //   }, 100)
  // }
}
