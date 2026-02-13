
;; agent-identity-registry.clar
;; Implements SIP-009 NFT standard for Agent Identity

(impl-trait .nft-trait.nft-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-agent-exists (err u102))
(define-constant err-agent-not-found (err u103))
(define-constant err-invalid-signature (err u104))

;; Data Vars
(define-data-var last-agent-id uint u0)

;; Define NFT
(define-non-fungible-token agent-identity uint)

;; Maps
(define-map agent-data uint 
  {
    bitcoin-address: (buff 20), ;; p2pkh or p2wpkh hash
    registered-at: uint,
    endpoint: (string-ascii 256),
    active: bool
  }
)

(define-map principal-to-agent-id principal uint)

;; SIP-009 Standard Functions

(define-read-only (get-last-token-id)
  (ok (var-get last-agent-id))
)

(define-read-only (get-token-uri (token-id uint))
  (match (map-get? agent-data token-id)
    agent (ok (some (get endpoint agent)))
    (ok none)
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? agent-identity token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? agent-identity token-id sender recipient)
  )
)

;; Core Agent Registry Functions

(define-public (register-agent (bitcoin-address (buff 20)) (endpoint (string-ascii 256)))
  (let
    (
      (new-id (+ (var-get last-agent-id) u1))
      (caller tx-sender)
    )
    (asserts! (is-none (map-get? principal-to-agent-id caller)) err-agent-exists)
    
    (try! (nft-mint? agent-identity new-id caller))
    
    (map-set agent-data new-id {
      bitcoin-address: bitcoin-address,
      registered-at: block-height, ;; Using block-height as timestamp proxy per standard practice, or typical stacks block time
      endpoint: endpoint,
      active: true
    })
    
    (map-set principal-to-agent-id caller new-id)
    (var-set last-agent-id new-id)
    (print {event: "agent-registered", agent-id: new-id, owner: caller})
    (ok new-id)
  )
)

(define-public (update-endpoint (new-endpoint (string-ascii 256)))
  (let
    (
      (caller tx-sender)
      (agent-id (unwrap! (map-get? principal-to-agent-id caller) err-agent-not-found))
      (current-data (unwrap! (map-get? agent-data agent-id) err-agent-not-found))
    )
    (map-set agent-data agent-id (merge current-data {endpoint: new-endpoint}))
    (ok true)
  )
)

(define-public (set-active-status (active bool))
  (let
    (
      (caller tx-sender)
      (agent-id (unwrap! (map-get? principal-to-agent-id caller) err-agent-not-found))
      (current-data (unwrap! (map-get? agent-data agent-id) err-agent-not-found))
    )
    (map-set agent-data agent-id (merge current-data {active: active}))
    (ok true)
  )
)

(define-read-only (get-agent-info (agent-id uint))
  (map-get? agent-data agent-id)
)

(define-read-only (get-agent-id (addr principal))
  (map-get? principal-to-agent-id addr)
)
