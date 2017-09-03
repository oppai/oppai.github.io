module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, href, style)
import Task
import Window exposing (..)
import Material
import Material.Scheme
import Material.Options as Options exposing (cs, css)
import Material.Card as Card
import Material.Button as Button 
import Material.Icon as Icon
import Material.Color as Color exposing (Color)
import Material.Elevation as Elevation


-- MODEL


type alias Model =
    { mdl : Material.Model
    , windowSize : Window.Size
    , userCell : CellModel
    , twitterCell : CellModel
    , githubCell : CellModel
    , facebookCell : CellModel
    , wishlistCell : CellModel
    , btcCoinCell : CoinCellModel
    , nemCoinCell : CoinCellModel
    , dogeCoinCell : CoinCellModel
    }


model : Model
model =
    { mdl = Material.model
    , windowSize = { width = 0, height = 0 }
    , userCell =
        { raised = False
        , image = "https://www.gravatar.com/avatar/107c8aa13ba2d660df1e27614c843f75?size=512"
        , cellType = UserCellType
        , url = "https://oppai.github.io"
        , color = Color.color Color.BlueGrey Color.S700
        }
    , twitterCell =
        { raised = False
        , image = "/images/twitter.png"
        , cellType = TwitterCellType
        , url = "https://twitter.com/kodam"
        , color = Color.color Color.Blue Color.S50
        }
    , githubCell =
        { raised = False
        , image = "/images/github.png"
        , cellType = GithubCellType
        , url = "https://github.com/oppai"
        , color = Color.color Color.Pink Color.S200
        }
    , facebookCell =
        { raised = False
        , image = "/images/facebook.png"
        , cellType = FacebookCellType
        , url = "https://www.facebook.com/hiroaki.murayama.399"
        , color = Color.color Color.Teal Color.S300
        }
    , wishlistCell =
        { raised = False
        , image = "/images/amazon.png"
        , cellType = WishlistCellType
        , url = "http://www.amazon.co.jp/registry/wishlist/21DI5R3QOUBXI/"
        , color = Color.color Color.Amber Color.S300
        }
    , btcCoinCell =
        { raised = False
        , image = "/images/counter-party.png"
        , qrImage = "/images/counter-party-qr.png"
        , cellType = BtcCellType
        , color = Color.color Color.Yellow Color.S600
        , title = "BTC/CounterParty"
        , subtitle = "1LvyEnNhFKHkV32YkyHzUvFddFXyoEEBPm"
        }
    , nemCoinCell =
        { raised = False
        , image = "/images/nem.png"
        , qrImage = "/images/nem-qr.jpg"
        , cellType = NemCellType
        , color = Color.color Color.Teal Color.S600
        , title = "NEM"
        , subtitle = "ND3MJ7-U45Q26-VZOG6S-EEGPTC-QCZMKF-N2X5GX-4N42"
        }
    , dogeCoinCell =
        { raised = False
        , image = "/images/doge.png"
        , qrImage = "/images/doge-qr.png"
        , cellType = DogeCellType
        , color = Color.color Color.Brown Color.S600
        , title = "DOGE"
        , subtitle = "DAk7obvEyivA75GFckPnErARSZh8WZWPvS"
        }
    }

type alias CellModel =
    { raised : Bool
    , image : String
    , cellType : CellType
    , url : String
    , color : Color
    }

type alias CoinCellModel =
    { raised : Bool
    , image : String
    , qrImage : String
    , cellType : CellType
    , color : Color
    , title : String
    , subtitle : String
    }


white : Options.Property c m
white =
    Color.text Color.white

margin1 : Options.Property a b
margin1 = 
      css "margin" "0"

margin2 : Options.Property a b
margin2 = 
      css "margin" "4px 8px 4px 0px"


-- ACTION, UPDATE


type Msg
    = Mdl (Material.Msg Msg)
    | Raise CellType Bool
    | WindowResult Window.Size

type CellType
    = UserCellType
    | TwitterCellType
    | GithubCellType
    | FacebookCellType
    | WishlistCellType
    | BtcCellType
    | NemCellType
    | DogeCellType

-- Boilerplate: Msg clause for internal Mdl messages.


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- Boilerplate: Mdl action handler.
        Mdl msg_ ->
            Material.update Mdl msg_ model
        WindowResult size ->
            ( { model | windowSize = size }, Cmd.none )
        Raise UserCellType raised ->
            let
                usercell = model.userCell
                newCell = { usercell | raised = raised }
            in
                ( { model | userCell = newCell }, Cmd.none )
        Raise TwitterCellType raised ->
            let
                twittercell = model.twitterCell
                newCell = { twittercell | raised = raised }
            in
                ( { model | twitterCell = newCell }, Cmd.none )
        Raise GithubCellType raised ->
            let
                githubcell = model.githubCell
                newCell = { githubcell | raised = raised }
            in
                ( { model | githubCell = newCell }, Cmd.none )
        Raise FacebookCellType raised ->
            let
                facebookcell = model.facebookCell
                newCell = { facebookcell | raised = raised }
            in
                ( { model | facebookCell = newCell }, Cmd.none )
        Raise WishlistCellType raised ->
            let
                wishlistcell = model.wishlistCell
                newCell = { wishlistcell | raised = raised }
            in
                ( { model | wishlistCell = newCell }, Cmd.none )
        Raise BtcCellType raised ->
            let
                coincell = model.btcCoinCell
                newCell = { coincell | raised = raised }
            in
                ( { model | btcCoinCell = newCell }, Cmd.none )
        Raise NemCellType raised ->
            let
                coincell = model.nemCoinCell
                newCell = { coincell | raised = raised }
            in
                ( { model | nemCoinCell = newCell }, Cmd.none )
        Raise DogeCellType raised ->
            let
                coincell = model.dogeCoinCell
                newCell = { coincell | raised = raised }
            in
                ( { model | dogeCoinCell = newCell }, Cmd.none )


-- VIEW


type alias Mdl =
    Material.Model

view : Model -> Html Msg
view model =
    Html.main_
        [ class "mdl-layout__content"
        , style [ ("width", "100%") ]
        ]
        [ Options.div
            [ cs "page-content"
            , css "margin-left" "50px"
            ]
            [ Html.h3 [] [ Html.text "kodam's profile page" ]
            , Options.div
                []
                [ Options.div [ css "display" "flex"
                              , css "flex-wrap" "wrap"
                              , css "width" "90%"
                              ]
                              [ Options.div []
                                            [ userCellView model.userCell ]
                              , Options.div [ css "align-content" "flex-start"
                                            , css "display" "flex"
                                            , css "flex-wrap" "wrap"
                                            , css "width" "320px"
                                            ]
                                            [ linkCellView model.twitterCell
                                            , linkCellView model.githubCell
                                            , linkCellView model.facebookCell
                                            , linkCellView model.wishlistCell
                                            ]
                              ]
                , Options.div []
                              [ coinCellView model.nemCoinCell model.windowSize.width
                              , coinCellView model.btcCoinCell model.windowSize.width
                              , coinCellView model.dogeCoinCell model.windowSize.width
                              ]
                ]
            ]
        ]
        |> Material.Scheme.top


userCellView : CellModel -> Html Msg
userCellView model =
    let
        width = "264px"
        height = "264px"
    in
        Card.view
            [ css "width" width
            , css "height" height
            , margin2
            , Color.background model.color
            -- Elevation
            , if model.raised then Elevation.e8 else Elevation.e2
            , Elevation.transition 250
            , Options.onMouseEnter (Raise model.cellType True)
            , Options.onMouseLeave (Raise model.cellType False)
            ]
            [ Card.media 
                [ css "background" ("url('" ++ model.image ++ "') center / cover")
                , css "height" height
                ]
                []
            , Card.title [ css "height" "64px" ] 
                [ Card.head [ white ] [ text "kodam a.k.a. oppai" ] 
                ]
            ]

linkCellView : CellModel -> Html Msg
linkCellView model =
    let
        width = "128px"
        height = "128px"
        thumb_width = "96px"
        thumb_height = "96px"
    in
        Card.view
            [ css "width" width
            , Color.background model.color
            , if model.raised then Elevation.e8 else Elevation.e2
            , if model.raised then Elevation.e8 else Elevation.e2
            , Elevation.transition 250
            , Options.onMouseEnter (Raise model.cellType True)
            , Options.onMouseLeave (Raise model.cellType False)
            , margin2
            ]
            [ Card.title 
                [ css "align-content" "flex-start" 
                , css "flex-direction" "row" 
                , css "align-items" "flex-start"
                , css "justify-content" "space-between"
                ] 
                [ Html.a [ href model.url ]
                        [
                            Options.img 
                            [ Options.attribute <| Html.Attributes.src model.image
                            , css "height" thumb_height
                            , css "width" thumb_width
                            ]
                            []
                        ]
                ]
            ]


coinCellView : CoinCellModel -> Int -> Html Msg
coinCellView model width =
    Card.view
      [ css "width" (if width > 400 then "534px" else "260px")
      , css "height" (if width > 400 then "90px" else "100px")
      , Color.background model.color
      , if model.raised then Elevation.e8 else Elevation.e2
      , if model.raised then Elevation.e8 else Elevation.e2
      , Elevation.transition 250
      , Options.onMouseEnter (Raise model.cellType True)
      , Options.onMouseLeave (Raise model.cellType False)
      , margin2
      , css "background" ("url('" ++ model.image ++ "') center / cover")
      ]
      [ Card.title
          [ css "align-content" "flex-start"
          , css "flex-direction" "row"
          , css "align-items" "flex-start"
          , css "justify-content" "space-between"
          , css "padding" "8px"
          ]
          [ Options.div
              []
              [ Card.head [ white ] [ text model.title ]
              , Card.subhead [ white ] [ text model.subtitle ]
              ]
          , Options.img
              [ Options.attribute <| Html.Attributes.src model.qrImage
              , css "height" "64px"
              , css "width" "64px"
              ]
              []
          ]
      ]

-- do here, but rather in your master .html file. See the documentation
-- for the `Material` module for details.


init : ( Model, Cmd Msg )
init =
    model ! [ Task.perform WindowResult Window.size ]

main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , subscriptions = always Sub.none
        , update = update
        }
