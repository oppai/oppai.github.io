module Main exposing (..)

import Browser
import Html
import Html.Attributes exposing (class, href, style, src)
import Browser.Dom as Dom
import Browser.Events
import Task
import Element exposing (Element, layout, column, row, el, padding, spacing, centerX, centerY, width, height, fill, px, rgb255, rgba255, alignRight)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input as Input
import Element.Events as Events


-- MODEL


type alias Model =
    { windowSize : { width : Int, height : Int }
    , userCell : CellModel
    , twitterCell : CellModel
    , githubCell : CellModel
    , facebookCell : CellModel
    , wishlistCell : CellModel
    , btcCoinCell : CoinCellModel
    , nemCoinCell : CoinCellModel
    , dogeCoinCell : CoinCellModel
    }


initialModel : Model
initialModel =
    { windowSize = { width = 0, height = 0 }
    , userCell =
        { raised = False
        , image = "https://www.gravatar.com/avatar/107c8aa13ba2d660df1e27614c843f75?size=512"
        , cellType = UserCellType
        , url = "https://oppai.github.io"
        , color = { r = 55, g = 71, b = 79 } -- BlueGrey S700
        }
    , twitterCell =
        { raised = False
        , image = "/images/x.png"
        , cellType = TwitterCellType
        , url = "https://x.com/kodam"
        , color = { r = 227, g = 242, b = 253 } -- Blue S50
        }
    , githubCell =
        { raised = False
        , image = "/images/github.png"
        , cellType = GithubCellType
        , url = "https://github.com/oppai"
        , color = { r = 238, g = 238, b = 238 } -- Grey S200
        }
    , facebookCell =
        { raised = False
        , image = "/images/facebook.png"
        , cellType = FacebookCellType
        , url = "https://www.facebook.com/hiroaki.murayama.399"
        , color = { r = 178, g = 223, b = 219 } -- Teal S300
        }
    , wishlistCell =
        { raised = False
        , image = "/images/amazon.png"
        , cellType = WishlistCellType
        , url = "http://www.amazon.co.jp/registry/wishlist/21DI5R3QOUBXI/"
        , color = { r = 255, g = 224, b = 130 } -- Amber S300
        }
    , btcCoinCell =
        { raised = False
        , image = "/images/counter-party.png"
        , qrImage = "/images/counter-party-qr.png"
        , cellType = BtcCellType
        , color = { r = 253, g = 216, b = 53 } -- Yellow S600
        , title = "BTC/CounterParty"
        , subtitle = "1LvyEnNhFKHkV32YkyHzUvFddFXyoEEBPm"
        }
    , nemCoinCell =
        { raised = False
        , image = "/images/nem.png"
        , qrImage = "/images/nem-qr.jpg"
        , cellType = NemCellType
        , color = { r = 77, g = 182, b = 172 } -- Teal S600
        , title = "NEM"
        , subtitle = "ND3MJ7-U45Q26-VZOG6S-EEGPTC-QCZMKF-N2X5GX-4N42"
        }
    , dogeCoinCell =
        { raised = False
        , image = "/images/doge.png"
        , qrImage = "/images/doge-qr.png"
        , cellType = DogeCellType
        , color = { r = 109, g = 76, b = 65 } -- Brown S600
        , title = "DOGE"
        , subtitle = "DAk7obvEyivA75GFckPnErARSZh8WZWPvS"
        }
    }

type alias CellModel =
    { raised : Bool
    , image : String
    , cellType : CellType
    , url : String
    , color : { r : Int, g : Int, b : Int }
    }

type alias CoinCellModel =
    { raised : Bool
    , image : String
    , qrImage : String
    , cellType : CellType
    , color : { r : Int, g : Int, b : Int }
    , title : String
    , subtitle : String
    }


-- ACTION, UPDATE


type Msg
    = Raise CellType Bool
    | GotViewport Dom.Viewport
    | WindowResize Int Int

type CellType
    = UserCellType
    | TwitterCellType
    | GithubCellType
    | FacebookCellType
    | WishlistCellType
    | BtcCellType
    | NemCellType
    | DogeCellType


update : Msg -> Model -> ( Model, Cmd Msg )
update msg appModel =
    case msg of
        GotViewport viewport ->
            ( { appModel | windowSize = { width = round viewport.viewport.width, height = round viewport.viewport.height } }, Cmd.none )
        WindowResize width height ->
            ( { appModel | windowSize = { width = width, height = height } }, Cmd.none )
        Raise UserCellType raised ->
            let
                usercell = appModel.userCell
                newCell = { usercell | raised = raised }
            in
                ( { appModel | userCell = newCell }, Cmd.none )
        Raise TwitterCellType raised ->
            let
                twittercell = appModel.twitterCell
                newCell = { twittercell | raised = raised }
            in
                ( { appModel | twitterCell = newCell }, Cmd.none )
        Raise GithubCellType raised ->
            let
                githubcell = appModel.githubCell
                newCell = { githubcell | raised = raised }
            in
                ( { appModel | githubCell = newCell }, Cmd.none )
        Raise FacebookCellType raised ->
            let
                facebookcell = appModel.facebookCell
                newCell = { facebookcell | raised = raised }
            in
                ( { appModel | facebookCell = newCell }, Cmd.none )
        Raise WishlistCellType raised ->
            let
                wishlistcell = appModel.wishlistCell
                newCell = { wishlistcell | raised = raised }
            in
                ( { appModel | wishlistCell = newCell }, Cmd.none )
        Raise BtcCellType raised ->
            let
                coincell = appModel.btcCoinCell
                newCell = { coincell | raised = raised }
            in
                ( { appModel | btcCoinCell = newCell }, Cmd.none )
        Raise NemCellType raised ->
            let
                coincell = appModel.nemCoinCell
                newCell = { coincell | raised = raised }
            in
                ( { appModel | nemCoinCell = newCell }, Cmd.none )
        Raise DogeCellType raised ->
            let
                coincell = appModel.dogeCoinCell
                newCell = { coincell | raised = raised }
            in
                ( { appModel | dogeCoinCell = newCell }, Cmd.none )


-- VIEW


view : Model -> Html.Html Msg
view appModel =
    layout [] <|
        column [ width fill, padding 50, spacing 20 ]
            [ el [ Font.size 24, Font.bold ] (Element.text "kodam's profile page")
            , row [ width fill, spacing 20 ]
                [ userCellView appModel.userCell
                , column [ spacing 10 ]
                    [ row [ spacing 10 ]
                        [ linkCellView appModel.twitterCell
                        , linkCellView appModel.githubCell
                        ]
                    , row [ spacing 10 ]
                        [ linkCellView appModel.facebookCell
                        , linkCellView appModel.wishlistCell
                        ]
                    ]
                ]
            , column [ spacing 10 ]
                [ coinCellView appModel.nemCoinCell appModel.windowSize.width
                , coinCellView appModel.btcCoinCell appModel.windowSize.width
                , coinCellView appModel.dogeCoinCell appModel.windowSize.width
                ]
            ]


userCellView : CellModel -> Element Msg
userCellView cellModel =
    let
        cellWidth = 264
        cellHeight = 264
        elevation = if cellModel.raised then 8 else 2
    in
        column
            [ width (px cellWidth)
            , height (px cellHeight)
            , Background.color (rgb255 cellModel.color.r cellModel.color.g cellModel.color.b)
            , Border.shadow { offset = ( 0, elevation ), size = 0, blur = elevation * 2, color = rgba255 0 0 0 0.2 }
            , Events.onMouseEnter (Raise cellModel.cellType True)
            , Events.onMouseLeave (Raise cellModel.cellType False)
            ]
            [ el
                [ width (px cellWidth)
                , height (px (cellHeight - 64))
                , Background.image cellModel.image
                ]
                Element.none
            , el
                [ width fill
                , height (px 64)
                , padding 10
                , Font.color (rgb255 255 255 255)
                ]
                (Element.text "kodam a.k.a. oppai")
            ]


linkCellView : CellModel -> Element Msg
linkCellView cellModel =
    let
        cellWidth = 128
        cellHeight = 128
        thumbWidth = 96
        thumbHeight = 96
        elevation = if cellModel.raised then 8 else 2
    in
        Element.link
            [ width (px cellWidth)
            , height (px cellHeight)
            , Background.color (rgb255 cellModel.color.r cellModel.color.g cellModel.color.b)
            , Border.shadow { offset = ( 0, elevation ), size = 0, blur = elevation * 2, color = rgba255 0 0 0 0.2 }
            , Events.onMouseEnter (Raise cellModel.cellType True)
            , Events.onMouseLeave (Raise cellModel.cellType False)
            ]
            { url = cellModel.url
            , label =
                el
                    [ width (px thumbWidth)
                    , height (px thumbHeight)
                    , centerX
                    , centerY
                    , Background.image cellModel.image
                    ]
                    Element.none
            }


coinCellView : CoinCellModel -> Int -> Element Msg
coinCellView coinModel screenWidth =
    let
        cellWidth = if screenWidth > 400 then 534 else 260
        cellHeight = if screenWidth > 400 then 90 else 100
        elevation = if coinModel.raised then 8 else 2
    in
        row
            [ Element.width (px cellWidth)
            , Element.height (px cellHeight)
            , Background.color (rgb255 coinModel.color.r coinModel.color.g coinModel.color.b)
            , Border.shadow { offset = ( 0, elevation ), size = 0, blur = elevation * 2, color = rgba255 0 0 0 0.2 }
            , Events.onMouseEnter (Raise coinModel.cellType True)
            , Events.onMouseLeave (Raise coinModel.cellType False)
            , padding 8
            , Background.image coinModel.image
            ]
            [ column
                [ spacing 5 ]
                [ el [ Font.color (rgb255 255 255 255), Font.bold ] (Element.text coinModel.title)
                , el [ Font.color (rgb255 255 255 255), Font.size 14 ] (Element.text coinModel.subtitle)
                ]
            , el
                [ width (px 64)
                , height (px 64)
                , alignRight
                , Background.image coinModel.qrImage
                ]
                Element.none
            ]


init : () -> ( Model, Cmd Msg )
init _ =
    ( initialModel, Task.perform GotViewport Dom.getViewport )

subscriptions : Model -> Sub Msg
subscriptions _ =
    Browser.Events.onResize WindowResize

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , subscriptions = subscriptions
        , update = update
        }
