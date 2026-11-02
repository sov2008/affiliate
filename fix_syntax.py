with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'r', encoding='utf-8') as f:
    c = f.read()

bad_snippet = """        "answer": "No manual code is required; the promotional rate activates automatically when clicking our verified partner link."
      }
    ]
      },
      {
        "question": "Can I get free shipping with a 30% / $10 TF | eharmony Term US | CA 10.23.2019 promo code?",
        "answer": "30% / $10 TF | eharmony Term US | CA 10.23.2019 frequently offers free shipping thresholds or promotional codes that waive standard delivery charges at checkout."
      }
    ]
  },"""

fixed_snippet = """        "answer": "No manual code is required; the promotional rate activates automatically when clicking our verified partner link."
      }
    ]
  },"""

if bad_snippet in c:
    c = c.replace(bad_snippet, fixed_snippet, 1)
    with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'w', encoding='utf-8') as f:
        f.write(c)
    print("FIXED SYNTAX")
else:
    print("BAD SNIPPET NOT MATCHED")
