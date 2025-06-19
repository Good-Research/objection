require "formula"

class GrObjection < Formula
  desc "Runtime mobile exploration toolkit, for iOS & Android"
  homepage ""
  version "2.0.0"

  url do
    assets = GitHub.get_release("Good-Research", "objection", "v2.0.0-gr").fetch("assets")
    wheel = assets.find { |a| a["name"] == "objection-2.0.0-py3-none-any.whl" }["url"]
    [wheel, header: [
      "Accept: application/octet-stream",
      "Authorization: bearer #{GitHub::API.credentials}"
    ]]
  end

  def install
    system "pipx", "install", cached_download
  end
end

