import {Component, Input, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  favorites: FavoriteType[] = [];


  cart: CartType | null = null;

  emptyFlag: boolean | null = null;

  serverStaticPath = environment.serverStaticPath;

  favoriteInCart: number | undefined = 0;


  count: number = 1;
  constructor(private favoriteService: FavoriteService, private _snackBar: MatSnackBar, private cartService: CartService) { }

  ngOnInit(): void {



    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;

      });

    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }


        this.favorites = data as FavoriteType[];

        this.emptyFlag = this.favorites.length <= 0;

          if(this.cart && this.cart.items.length > 0)  {
            this.favorites = this.favorites.map(favorite => {
              if(this.cart) {
                const productInCart = this.cart.items.find(item => item.product.id === favorite.id);
                if(productInCart) {
                  favorite.countInCart = productInCart.quantity;
                  console.log(favorite.countInCart);
                }
              }
              return favorite;
            });
            console.log(this.favorites);
          } else {
            this.favorites = data as FavoriteType[];
          }

      });
  }

  addToCart(id: string, countInCart: number) {
    if(countInCart && countInCart > 1) {
      this.count = countInCart;
    }
    this.cartService.updateCart(id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        //  finding the favorite with id and changing its countInCart by hand as we don't have them separately like in product component
        let chosenFavorite = this.favorites.find(favorite => favorite.id === id);
        (chosenFavorite as FavoriteType).countInCart = this.count;
      })
  }

  updateCount(value: number, id: string, countInCart: number ) {
    this.count = value;
    if(countInCart) {
      this.cartService.updateCart(id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          countInCart = this.count
        })
    }

  }

  removeFromCart(id: string ) {
    this.cartService.updateCart(id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        //  finding the favorite with id and changing its countInCart by hand as we don't have them separately like in product component
        let chosenFavorite = this.favorites.find(favorite => favorite.id === id);
        (chosenFavorite as FavoriteType).countInCart = 0;
        this.count = 1;
      })
  }
  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe(data => {
        if(data.error) {
          this._snackBar.open('The was an error during the attempt');
          throw new Error(data.message)
        }

        this.favorites = this.favorites.filter(item => item.id !== id);
      })
  }
}
